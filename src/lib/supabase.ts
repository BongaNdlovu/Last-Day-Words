import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_CANDLE_ID } from "../data/cosmetics";
import type { UserProgress } from "../types";
import { extractGameState, type GameStateSnapshot } from "../utils/progressSync";
import type { SpeedBoardMode } from "../utils/speedPools";
import { rankForUser } from "../utils/leaderboard";
import type { RemoteFetchResult, RemoteWriteResult } from "./syncResult";
import { writeErr, writeOk } from "./syncResult";

function readViteEnv(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().replace(/^["']|["']$/g, "");
  return trimmed || undefined;
}

const url = readViteEnv(import.meta.env.VITE_SUPABASE_URL);
const anon = readViteEnv(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(url && anon && /^https?:\/\/.+/i.test(url));

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anon!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export type Profile = {
  id: string;
  display_name: string;
  created_at?: string;
};

export type LeaderboardRow = {
  user_id: string;
  display_name: string;
  score: number;
  words_solved: number;
  week_key: string;
};

export type GameRoom = {
  id: string;
  code: string;
  host_id: string;
  status: "waiting" | "playing" | "finished";
  white_score: number;
  black_score: number;
  payload: Record<string, unknown>;
  created_at: string;
};

export async function fetchGameRoom(roomId: string): Promise<GameRoom | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("game_rooms")
    .select("id, code, host_id, status, white_score, black_score, payload, created_at")
    .eq("id", roomId)
    .maybeSingle();
  if (error) {
    console.error("fetchGameRoom failed:", error.message);
    throw error;
  }
  if (!data) return null;
  return data as GameRoom;
}

export async function startOnlineTeamsGame(
  roomId: string,
  payload: Record<string, unknown>
): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  const { error } = await supabase
    .from("game_rooms")
    .update({
      status: "playing",
      payload,
      white_score: 0,
      black_score: 0,
    })
    .eq("id", roomId);
  if (error) throw error;
}

export async function updateOnlineTeamsRoom(
  roomId: string,
  patch: {
    payload?: Record<string, unknown>;
    white_score?: number;
    black_score?: number;
    status?: GameRoom["status"];
  }
): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  const { error } = await supabase.from("game_rooms").update(patch).eq("id", roomId);
  if (error) throw error;
}

export async function leaveOnlineTeamsRoom(roomId: string, userId: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  await supabase.from("room_members").delete().eq("room_id", roomId).eq("user_id", userId);
}

export type UserProgressRow = {
  user_id: string;
  xp: number;
  rank: string;
  unlocked_cosmetics: string[] | null;
  selected_candle: string | null;
  selected_banner: string | null;
  game_state: GameStateSnapshot | null;
  updated_at?: string;
};

export function buildUserProgressRow(userId: string, progress: UserProgress): {
  user_id: string;
  xp: number;
  rank: string;
  unlocked_cosmetics: string[];
  selected_candle: string;
  selected_banner: string;
  game_state: GameStateSnapshot;
} {
  return {
    user_id: userId,
    xp: progress.xp ?? 0,
    rank: progress.rank ?? "novice",
    unlocked_cosmetics: progress.unlockedCosmetics ?? ["candle-classic"],
    selected_candle: progress.selectedCandle ?? DEFAULT_CANDLE_ID,
    selected_banner: progress.selectedBanner ?? "",
    game_state: extractGameState(progress),
  };
}

export async function fetchUserProgress(
  userId: string
): Promise<RemoteFetchResult<UserProgressRow>> {
  if (!supabase || !isSupabaseConfigured) return { status: "empty" };
  const { data, error } = await supabase
    .from("user_progress")
    .select(
      "user_id, xp, rank, unlocked_cosmetics, selected_candle, selected_banner, game_state, updated_at"
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("fetchUserProgress failed:", error.message);
    return { status: "error", message: error.message };
  }
  if (!data) return { status: "empty" };
  return { status: "ok", data: data as UserProgressRow };
}

export async function fetchWeeklyLeaderboardPlacements(
  userId: string,
  weekKey: string
): Promise<{ mixed: number | null; chapter: number | null }> {
  if (!supabase || !isSupabaseConfigured) {
    return { mixed: null, chapter: null };
  }
  const modes = ["mixed", "chapter"] as const;
  const placements: { mixed: number | null; chapter: number | null } = {
    mixed: null,
    chapter: null,
  };
  for (const mode of modes) {
    const { data, error } = await supabase
      .from("speed_scores")
      .select("user_id, score")
      .eq("week_key", weekKey)
      .eq("mode", mode)
      .order("score", { ascending: false });
    if (error) {
      console.error(`fetchWeeklyLeaderboardPlacements(${mode}) failed:`, error.message);
      continue;
    }
    placements[mode] = rankForUser(userId, data ?? []);
  }
  return placements;
}

/** Server-gated weekly speed score submit (edge function + DB trigger). */
export async function submitSpeedScoreToEdge(params: {
  weekKey: string;
  mode: SpeedBoardMode;
  score: number;
  wordsSolved: number;
}): Promise<RemoteWriteResult & { score?: number; wordsSolved?: number }> {
  if (!supabase || !isSupabaseConfigured) return writeOk();
  const { data, error } = await supabase.functions.invoke("submit-speed-score", {
    body: {
      week_key: params.weekKey,
      mode: params.mode,
      score: params.score,
      words_solved: params.wordsSolved,
    },
  });
  if (error) {
    console.error("submitSpeedScoreToEdge failed:", error.message);
    return writeErr(error.message);
  }
  const payload = data as { ok?: boolean; error?: string; message?: string; score?: number; words_solved?: number };
  if (!payload?.ok) {
    const msg = payload?.message ?? payload?.error ?? "submit_rejected";
    return writeErr(msg);
  }
  return {
    ...writeOk(),
    score: payload.score,
    wordsSolved: payload.words_solved,
  };
}

export async function upsertUserProgress(row: {
  user_id: string;
  xp: number;
  rank: string;
  unlocked_cosmetics: string[];
  selected_candle: string;
  selected_banner: string;
  game_state: GameStateSnapshot;
}): Promise<RemoteWriteResult> {
  if (!supabase || !isSupabaseConfigured) return writeOk();
  const { error } = await supabase.from("user_progress").upsert(
    {
      ...row,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) {
    console.error("upsertUserProgress failed:", error.message);
    return writeErr(error.message);
  }
  return writeOk();
}
