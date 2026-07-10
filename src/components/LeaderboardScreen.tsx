import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Crown, RefreshCw, Trophy } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { supabase, isSupabaseConfigured, LeaderboardRow } from "../lib/supabase";
import { getLeaderboardWeekKey } from "../utils/leaderboard";
import { EmptyState, LoadingBlock } from "./ErrorState";
import { logError, mapUserFacingError } from "../utils/errors";
import type { SpeedBoardMode } from "../utils/speedPools";
import { assignLeaderboardRanks } from "../utils/leaderboard";

interface LeaderboardScreenProps {
  onBack: () => void;
}

type LoadState = "loading" | "ready" | "error" | "unconfigured";
type RankedRow = LeaderboardRow & { rank: number };

const PODIUM_STYLES: Record<
  number,
  { ring: string; badge: string; label: string }
> = {
  1: { ring: "ring-[#f5b301]", badge: "bg-[#f5b301] text-[#101014]", label: "Champion" },
  2: { ring: "ring-[#9ca3af]", badge: "bg-[#9ca3af] text-[#1f2937]", label: "2nd" },
  3: { ring: "ring-[#b06c2f]", badge: "bg-[#b06c2f] text-[#fef3c7]", label: "3rd" },
};

function initialOf(name: string): string {
  return (name || "?").trim().slice(0, 1).toUpperCase();
}

export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const rm = useReducedMotion();
  const [boardMode, setBoardMode] = useState<SpeedBoardMode>("mixed");
  const [rows, setRows] = useState<RankedRow[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>(
    isSupabaseConfigured ? "loading" : "unconfigured"
  );
  const week = getLeaderboardWeekKey();

  const load = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      setLoadState("unconfigured");
      setError(null);
      setRows([]);
      return;
    }
    setLoadState("loading");
    setError(null);
    try {
      const [{ data, error: err }, { data: userData }] = await Promise.all([
        supabase
          .from("speed_scores")
          .select("user_id, score, words_solved, week_key, mode")
          .eq("week_key", week)
          .eq("mode", boardMode)
          .order("score", { ascending: false })
          .limit(25),
        supabase.auth.getUser(),
      ]);
      if (err) throw err;
      setMyUserId(userData.user?.id ?? null);

      const ids = (data ?? []).map((r) => r.user_id as string);
      const { data: profiles, error: profileErr } = ids.length
        ? await supabase.from("profiles").select("id, display_name").in("id", ids)
        : { data: [] as { id: string; display_name: string }[], error: null };
      if (profileErr) {
        logError("leaderboard.profiles", profileErr);
        // Non-fatal: still show scores with fallback names
      }

      const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
      const ranked = assignLeaderboardRanks(
        (data ?? []).map((row) => ({
          user_id: row.user_id as string,
          score: row.score as number,
          words_solved: row.words_solved as number,
        }))
      );
      const mapped = ranked.map((row) => ({
        user_id: row.user_id,
        display_name: nameById.get(row.user_id) ?? "Watchman",
        score: row.score,
        words_solved: row.words_solved ?? 0,
        week_key: week,
        rank: row.rank,
      }));
      setRows(mapped);
      setLoadState("ready");
    } catch (e) {
      logError("leaderboard.load", e);
      setError(mapUserFacingError(e, "Could not load the leaderboard"));
      setRows([]);
      setLoadState("error");
    }
  }, [week, boardMode]);

  useEffect(() => {
    void load();
  }, [load]);

  const boardLabel = boardMode === "mixed" ? "Mixed Speed" : "Chapter Speed";
  const podium = rows.filter((r) => r.rank <= 3);
  const rest = rows.filter((r) => r.rank > 3);
  // Silver · Gold · Bronze display order, keeping gold center-stage
  const podiumOrder = [2, 1, 3]
    .map((rank) => podium.find((r) => r.rank === rank))
    .filter((r): r is RankedRow => Boolean(r));

  const entrance = (delay: number) =>
    rm
      ? { initial: false as const, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, delay },
        };

  return (
    <div className="max-w-lg mx-auto space-y-5 py-2 px-2">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#c9c2b4] font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
        </button>
        <h2 className="text-lg font-display font-bold tracking-[0.1em] text-[#f4f1ea]">
          WEEKLY BOARDS
        </h2>
        <button
          type="button"
          onClick={() => void load()}
          aria-label="Refresh leaderboard"
          className="w-12 flex justify-end text-[#c9c2b4] cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 p-1 psunken rounded-2xl">
        {(["mixed", "chapter"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setBoardMode(m)}
            aria-pressed={boardMode === m}
            className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
              boardMode === m
                ? "bg-[#101014] text-[#fbbf24] shadow-md"
                : "text-[#c9c2b4] hover:bg-white/10"
            }`}
          >
            {m === "mixed" ? "Mixed Speed" : "Chapter Speed"}
          </button>
        ))}
      </div>

      <p className="text-center text-[10px] text-[#a49b8d] uppercase tracking-[0.2em] font-bold">
        {boardLabel} · week of {week} (SAST)
      </p>

      {loadState === "unconfigured" && (
        <EmptyState
          icon="alert"
          title="Leaderboard unavailable"
          message="Configure Supabase (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) to load weekly scores. Local play still works."
        />
      )}

      {loadState === "loading" && <LoadingBlock label="Loading this week’s board…" />}

      {loadState === "error" && error && (
        <EmptyState
          icon="wifi"
          title="Couldn’t load board"
          message={error}
          actionLabel="Try again"
          onAction={() => void load()}
        />
      )}

      {loadState === "ready" && rows.length === 0 && (
        <EmptyState
          icon="inbox"
          title="No scores yet"
          message={`Be the first this week — finish a ${boardLabel} run while signed in.`}
        />
      )}

      {loadState === "ready" && podiumOrder.length > 0 && (
        <div className="relative overflow-hidden pcard rounded-3xl px-4 pt-8 pb-6 parchment-glow">
          <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.22),transparent_70%)]" />
          <div className="relative grid grid-cols-3 items-end gap-2">
            {podiumOrder.map((r) => {
              const style = PODIUM_STYLES[r.rank];
              const isFirst = r.rank === 1;
              const isMe = myUserId === r.user_id;
              return (
                <motion.div
                  key={r.user_id}
                  {...entrance(isFirst ? 0 : 0.12)}
                  className={`flex flex-col items-center text-center gap-1.5 ${isFirst ? "" : "pt-6"}`}
                >
                  {isFirst && (
                    <Crown className="w-5 h-5 text-[#f5b301] -mb-0.5" aria-hidden="true" />
                  )}
                  <div
                    className={`${isFirst ? "w-16 h-16 text-xl" : "w-12 h-12 text-base"} rounded-full bg-[#101014] text-[#fbbf24] flex items-center justify-center font-display font-bold ring-2 ring-offset-2 ring-offset-[#101014] ${style.ring}`}
                  >
                    {initialOf(r.display_name)}
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badge}`}
                  >
                    {style.label}
                  </span>
                  <span className="text-xs font-bold text-[#f4f1ea] truncate max-w-full">
                    {r.display_name}
                    {isMe && <span className="text-[#f5b301]"> · You</span>}
                  </span>
                  <span className={`font-mono font-extrabold text-[#fbbf24] ${isFirst ? "text-lg" : "text-sm"}`}>
                    {r.score.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-[#a49b8d]">{r.words_solved} words</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {loadState === "ready" && rest.length > 0 && (
        <div className="pcard rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
          {rest.map((r, i) => {
            const isMe = myUserId === r.user_id;
            return (
              <motion.div
                key={r.user_id}
                {...entrance(0.15 + Math.min(i, 8) * 0.04)}
                className={`px-4 py-3 flex items-center gap-3 ${isMe ? "bg-[#fbbf24]/10" : ""}`}
              >
                <span className="w-7 text-center font-mono text-sm font-bold text-[#a49b8d]">
                  {r.rank}
                </span>
                <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/10 text-[#c9c2b4] flex items-center justify-center text-xs font-bold shrink-0">
                  {initialOf(r.display_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#f4f1ea] truncate">
                    {r.display_name}
                    {isMe && (
                      <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wider text-[#fbbf24] bg-[#fbbf24]/20 px-1.5 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#a49b8d]">{r.words_solved} words</div>
                </div>
                <div className="font-mono font-bold text-[#f4f1ea]">{r.score.toLocaleString()}</div>
              </motion.div>
            );
          })}
        </div>
      )}

      {loadState === "ready" && rows.length > 0 && (
        <div className="flex items-start gap-2 text-[11px] text-[#a49b8d] leading-relaxed px-1">
          <Trophy className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#f5b301]" aria-hidden="true" />
          <p>
            Top three earn a weekly board badge. Scores appear for signed-in players only — Mixed
            and Chapter are separate boards, and the board resets every week.
          </p>
        </div>
      )}
    </div>
  );
}
