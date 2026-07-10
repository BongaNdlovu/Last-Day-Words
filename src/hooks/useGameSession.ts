import { useCallback, useMemo } from "react";
import type { Chapter } from "../data/words";
import type { UserProgress } from "../types";
import { awardStudyGuideXp } from "../utils/progression";
import {
  canSubmitSpeedScore,
  markSpeedSubmitAttempt,
} from "../utils/speedScoreLimits";
import {
  getLeaderboardWeekKey,
  rankForUser,
  syncLeaderboardPlacementForMode,
} from "../utils/leaderboard";
import {
  applySpeedRoundToProgress,
  type SpeedRoundResult,
} from "../utils/speedRoundProgress";
import {
  isSupabaseConfigured,
  submitSpeedScoreToEdge,
  supabase,
} from "../lib/supabase";
import { logError, mapUserFacingError } from "../utils/errors";

type SaveProgress = (p: UserProgress) => void;
type RemoteErrorHandler = (message: string) => void;

export type { SpeedRoundResult };

/**
 * Speed-arcade session helpers (progress + dual leaderboard submit via edge).
 */
export function useGameSession(
  progress: UserProgress,
  saveProgress: SaveProgress,
  chaptersData: Chapter[],
  todayKey: string,
  onRemoteError?: RemoteErrorHandler
) {
  const allWordsList = useMemo(
    () => chaptersData.reduce((acc, ch) => [...acc, ...ch.words], [] as Chapter["words"]),
    [chaptersData]
  );

  const handleSpeedRoundFinished = useCallback(
    async (result: SpeedRoundResult) => {
      const { finalScore, wordsSolved, mode } = result;
      const next = applySpeedRoundToProgress(progress, result, todayKey);
      saveProgress(next);

      if (!supabase || !isSupabaseConfigured) return;

      // Client checks are UX only; edge function + DB trigger are the real gate.
      const gate = canSubmitSpeedScore(finalScore, wordsSolved, mode);
      if (!gate.ok) {
        if (gate.reason !== "submit_too_soon") {
          logError("speedScore.reject", new Error(gate.reason));
        }
        return;
      }
      markSpeedSubmitAttempt();

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const week = getLeaderboardWeekKey();
      const userId = userData.user.id;

      const submit = await submitSpeedScoreToEdge({
        weekKey: week,
        mode,
        score: finalScore,
        wordsSolved,
      });
      if (!submit.ok) {
        logError("speedScore.edge", new Error(submit.message));
        onRemoteError?.(
          mapUserFacingError(
            new Error(submit.message ?? "rejected"),
            "Speed score could not be saved to the leaderboard"
          )
        );
        return;
      }

      const { data: boardRows, error: boardErr } = await supabase
        .from("speed_scores")
        .select("user_id, score")
        .eq("week_key", week)
        .eq("mode", mode)
        .order("score", { ascending: false });
      if (boardErr) {
        logError("speedScore.rank", boardErr);
        return;
      }

      const rank = rankForUser(userId, boardRows ?? []);
      const withBadges = syncLeaderboardPlacementForMode(next, week, mode, rank);
      if (
        JSON.stringify(withBadges.earnedBadgeIds) !== JSON.stringify(next.earnedBadgeIds) ||
        JSON.stringify(withBadges.leaderboardRanks) !== JSON.stringify(next.leaderboardRanks)
      ) {
        saveProgress(withBadges);
      }
    },
    [progress, saveProgress, onRemoteError, todayKey]
  );

  const handleViewStudyGuide = useCallback(() => {
    const result = awardStudyGuideXp(progress, todayKey);
    if (result.awarded > 0) saveProgress(result.progress);
    return result.awarded > 0;
  }, [progress, saveProgress, todayKey]);

  return {
    allWordsList,
    handleSpeedRoundFinished,
    handleViewStudyGuide,
  };
}
