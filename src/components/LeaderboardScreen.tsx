import React, { useEffect, useState } from "react";
import { ArrowLeft, Trophy } from "lucide-react";
import { supabase, isSupabaseConfigured, LeaderboardRow } from "../lib/supabase";
import { getIsoWeekKey } from "../utils/streaks";

interface LeaderboardScreenProps {
  onBack: () => void;
}

export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [rows, setRows] = useState<(LeaderboardRow & { rank: number })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const week = getIsoWeekKey();

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data, error: err } = await supabase
        .from("speed_scores")
        .select("user_id, score, words_solved, week_key")
        .eq("week_key", week)
        .order("score", { ascending: false })
        .limit(25);
      if (err) {
        setError(err.message);
        return;
      }
      const ids = (data ?? []).map((r) => r.user_id as string);
      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("id, display_name").in("id", ids)
        : { data: [] as { id: string; display_name: string }[] };
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
    })();
  }, [week]);

  return (
    <div className="max-w-lg mx-auto space-y-6 py-2 px-2">
      <div className="flex items-center justify-between pb-4 border-b border-[#e2d2ac]">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#5c4a33] font-medium cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-lg font-display font-bold tracking-[0.1em] text-[#2a2018]">WEEKLY BOARD</h2>
        <div className="w-12" />
      </div>

      <p className="text-center text-xs text-[#6b5537] uppercase tracking-wider font-bold">
        Speed Round · {week}
      </p>

      {!isSupabaseConfigured && (
        <p className="text-sm text-red-800 text-center">Configure Supabase to load the leaderboard.</p>
      )}
      {error && <p className="text-sm text-red-800 text-center">{error}</p>}

      <div className="space-y-2">
        {rows.length === 0 && !error && (
          <p className="text-sm text-[#5c4a33] text-center py-8">No scores this week yet. Be the first!</p>
        )}
        {rows.map((r) => (
          <div key={r.user_id} className="pcard rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="w-8 text-center font-mono font-bold text-[#92400e]">#{r.rank}</span>
            <Trophy className="w-4 h-4 text-[#b45309]" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[#2a2018] truncate">{r.display_name}</div>
              <div className="text-[10px] text-[#6b5537]">{r.words_solved} words</div>
            </div>
            <div className="font-mono font-bold text-[#2a2018]">{r.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
