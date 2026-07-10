import { useCallback, useMemo } from "react";
import type { Chapter } from "../data/words";
import type { UserProgress } from "../types";
import { applyDailyStreakComplete, getIsoWeekKey } from "../utils/streaks";
import { awardSpeedXp, awardStudyGuideXp } from "../utils/progression";
import { isValidSpeedScore } from "../utils/speedScoreLimits";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { logError, mapUserFacingError } from "../utils/errors";

type SaveProgress = (p: UserProgress) => void;
type RemoteErrorHandler = (message: string) => void;

/**
 * Speed-arcade session helpers (progress + leaderboard upsert).
 * Chapter / daily hangman flows were removed — catalog still feeds speed from chaptersData.
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
    async (finalScore: number, solvedCount: number) => {
      let updatedHighScore = progress.speedRoundHighScore;
      let updatedSolvedMax = progress.speedRoundHighestWordsSolved;
      if (finalScore > progress.speedRoundHighScore) updatedHighScore = finalScore;
      if (solvedCount > progress.speedRoundHighestWordsSolved) updatedSolvedMax = solvedCount;
      let next: UserProgress = {
        ...progress,
        speedRoundHighScore: updatedHighScore,
        speedRoundHighestWordsSolved: updatedSolvedMax,
      };
      next = awardSpeedXp(next, finalScore).progress;
      // One speed finish per day keeps the lamp streak alive (arcade habit loop).
      if (solvedCount > 0) {
        next = applyDailyStreakComplete(next, todayKey);
      }
      saveProgress(next);

      if (supabase && isSupabaseConfigured && isValidSpeedScore(finalScore, solvedCount)) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const week = getIsoWeekKey();
          const { error } = await supabase.from("speed_scores").upsert(
            {
              user_id: userData.user.id,
              week_key: week,
              score: finalScore,
              words_solved: solvedCount,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,week_key" }
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
