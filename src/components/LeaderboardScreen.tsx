import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Trophy } from "lucide-react";
import { supabase, isSupabaseConfigured, LeaderboardRow } from "../lib/supabase";
import { getIsoWeekKey } from "../utils/streaks";
import { EmptyState, InlineAlert, LoadingBlock } from "./ErrorState";
import { logError, mapUserFacingError } from "../utils/errors";
import type { SpeedBoardMode } from "../utils/speedPools";

interface LeaderboardScreenProps {
  onBack: () => void;
}

type LoadState = "loading" | "ready" | "error" | "unconfigured";

export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [boardMode, setBoardMode] = useState<SpeedBoardMode>("mixed");
  const [rows, setRows] = useState<(LeaderboardRow & { rank: number })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>(
    isSupabaseConfigured ? "loading" : "unconfigured"
  );
  const week = getIsoWeekKey();

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
      const { data, error: err } = await supabase
        .from("speed_scores")
        .select("user_id, score, words_solved, week_key, mode")
        .eq("week_key", week)
        .eq("mode", boardMode)
        .order("score", { ascending: false })
        .limit(25);
      if (err) throw err;

      const ids = (data ?? []).map((r) => r.user_id as string);
      const { data: profiles, error: profileErr } = ids.length
        ? await supabase.from("profiles").select("id, display_name").in("id", ids)
        : { data: [] as { id: string; display_name: string }[], error: null };
      if (profileErr) {
        logError("leaderboard.profiles", profileErr);
        // Non-fatal: still show scores with fallback names
      }

      const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
      const mapped = (data ?? []).map((row, i) => ({
        user_id: row.user_id as string,
        display_name: nameById.get(row.user_id as string) ?? "Watchman",
        score: row.score as number,
        words_solved: row.words_solved as number,
        week_key: row.week_key as string,
        rank: i + 1,
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

  return (
    <div className="max-w-lg mx-auto space-y-6 py-2 px-2">
      <div className="flex items-center justify-between pb-4 border-b border-[#e2d2ac]">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#5c4a33] font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
        </button>
        <h2 className="text-lg font-display font-bold tracking-[0.1em] text-[#2a2018]">
          WEEKLY BOARDS
        </h2>
        <div className="w-12" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setBoardMode("mixed")}
          aria-pressed={boardMode === "mixed"}
          className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer border ${
            boardMode === "mixed"
              ? "bg-[#2a2018] text-[#f8f1e3] border-[#2a2018]"
              : "bg-[#fbf5e9] text-[#5c4a33] border-[#e2d2ac]"
          }`}
        >
          Mixed Speed
        </button>
        <button
          type="button"
          onClick={() => setBoardMode("chapter")}
          aria-pressed={boardMode === "chapter"}
          className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer border ${
            boardMode === "chapter"
              ? "bg-[#2a2018] text-[#f8f1e3] border-[#2a2018]"
              : "bg-[#fbf5e9] text-[#5c4a33] border-[#e2d2ac]"
          }`}
        >
          Chapter Speed
        </button>
      </div>

      <p className="text-center text-xs text-[#6b5537] uppercase tracking-wider font-bold">
        {boardLabel} · {week}
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

      {loadState === "ready" && (
        <div className="space-y-2">
          {rows.length === 0 ? (
            <EmptyState
              icon="inbox"
              title="No scores yet"
              message={`Be the first this week — finish a ${boardLabel} run while signed in.`}
            />
          ) : (
            rows.map((r) => (
              <div key={r.user_id} className="pcard rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="w-8 text-center font-mono font-bold text-[#92400e]">#{r.rank}</span>
                <Trophy className="w-4 h-4 text-[#b45309]" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#2a2018] truncate">{r.display_name}</div>
                  <div className="text-[10px] text-[#6b5537]">{r.words_solved} words</div>
                </div>
                <div className="font-mono font-bold text-[#2a2018]">{r.score}</div>
              </div>
            ))
          )}
        </div>
      )}

      {loadState === "ready" && rows.length > 0 && (
        <InlineAlert
          tone="info"
          message="Scores only appear for signed-in players with a valid cloud save. Mixed and Chapter are separate boards."
        />
      )}
    </div>
  );
}
