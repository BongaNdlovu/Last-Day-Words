import { useCallback, useMemo } from "react";
import type { Chapter } from "../data/words";
import type { UserProgress } from "../types";
import { applyDailyStreakComplete, getIsoWeekKey } from "../utils/streaks";
import { awardPerfectWordsXp, awardSpeedXp, awardStudyGuideXp } from "../utils/progression";
import { isValidSpeedScore } from "../utils/speedScoreLimits";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { logError, mapUserFacingError } from "../utils/errors";
import type { SpeedBoardMode } from "../utils/speedPools";

type SaveProgress = (p: UserProgress) => void;
type RemoteErrorHandler = (message: string) => void;

export type SpeedRoundResult = {
  finalScore: number;
  wordsSolved: number;
  perfectCount: number;
  mode: SpeedBoardMode;
};

/**
 * Speed-arcade session helpers (progress + dual leaderboard upsert).
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
      const { finalScore, wordsSolved, perfectCount, mode } = result;
      const highKey = mode === "mixed" ? "speedMixedHighScore" : "speedChapterHighScore";
      const wordsKey =
        mode === "mixed" ? "speedMixedHighestWordsSolved" : "speedChapterHighestWordsSolved";

      const prevHigh =
        (progress[highKey] as number | undefined) ??
        (mode === "mixed" ? progress.speedRoundHighScore : 0);
      const prevWords =
        (progress[wordsKey] as number | undefined) ??
        (mode === "mixed" ? progress.speedRoundHighestWordsSolved : 0);

      let next: UserProgress = {
        ...progress,
        [highKey]: Math.max(prevHigh, finalScore),
        [wordsKey]: Math.max(prevWords, wordsSolved),
        // Keep legacy fields as overall best for share card / older UI
        speedRoundHighScore: Math.max(progress.speedRoundHighScore, finalScore),
        speedRoundHighestWordsSolved: Math.max(progress.speedRoundHighestWordsSolved, wordsSolved),
      };

      // Perfect solves (+25 each) then round score XP
      next = awardPerfectWordsXp(next, perfectCount).progress;
      next = awardSpeedXp(next, finalScore).progress;

      if (wordsSolved > 0) {
        next = applyDailyStreakComplete(next, todayKey);
      }
      saveProgress(next);

      if (supabase && isSupabaseConfigured && isValidSpeedScore(finalScore, wordsSolved)) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const week = getIsoWeekKey();
          const { error } = await supabase.from("speed_scores").upsert(
            {
              user_id: userData.user.id,
              week_key: week,
              mode,
              score: finalScore,
              words_solved: wordsSolved,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,week_key,mode" }
          );
          if (error) {
            logError("speedScore.upsert", error);
            onRemoteError?.(
              mapUserFacingError(error, "Speed score could not be saved to the leaderboard")
            );
          }
        }
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
