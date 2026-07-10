import { useCallback, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import type { Chapter, WordTerm } from "../data/words";
import type { StudyPassage } from "../data/studyContent";
import { CHAPTER_MASTERY_UNLOCKS, FRAGMENTS_NEEDED, pickMysteryFragment, pickPerfectBonus } from "../data/studyContent";
import type { UserProgress } from "../types";
import { buildDailyChapter } from "../utils/dailyChallenge";
import { applyDailyStreakComplete, maybeEarnStreakFreeze, getIsoWeekKey } from "../utils/streaks";
import { getDailyBonusWordId, isDailyBonusWord } from "../utils/rewards";
import {
  calcStars,
  getMaxMistakes,
  getWordDifficulty,
  recordWordAttempt,
  buildReviewChapter,
  getChapterMastery,
} from "../utils/gameLogic";
import {
  awardDailyCompleteXp,
  awardPerfectWordXp,
  awardSpeedXp,
  awardStudyGuideXp,
} from "../utils/progression";
import {
  appendRunSolvedWord,
  isChapterRunComplete,
  isDailyRunComplete,
} from "../utils/runCompletion";
import { isValidSpeedScore } from "../utils/speedScoreLimits";
import { computeDailyScore, isValidDailyScore } from "../utils/dailyScore";
import { supabase, isSupabaseConfigured, upsertDailyScore } from "../lib/supabase";
import { logError, mapUserFacingError } from "../utils/errors";
import { playRoundEndSound } from "../utils/sounds";

type SaveProgress = (p: UserProgress) => void;
type RemoteErrorHandler = (message: string) => void;

export function useGameSession(
  progress: UserProgress,
  saveProgress: SaveProgress,
  chaptersData: Chapter[],
  todayKey: string,
  onRemoteError?: RemoteErrorHandler
) {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [chapterRunStars, setChapterRunStars] = useState<number[]>([]);
  const [chapterRunSolvedIds, setChapterRunSolvedIds] = useState<string[]>([]);
  const [isDailyMode, setIsDailyMode] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewChapter, setReviewChapter] = useState<Chapter | null>(null);
  const [expertMode, setExpertMode] = useState(false);

  const [solvedWordState, setSolvedWordState] = useState<{
    word: WordTerm;
    mistakes: number;
    hintsUsed: number;
  } | null>(null);
  const [pendingScriptureBonus, setPendingScriptureBonus] = useState<StudyPassage | null>(null);
  const [pendingFragment, setPendingFragment] = useState<StudyPassage | null>(null);
  const [pendingMasteryUnlock, setPendingMasteryUnlock] = useState<StudyPassage | null>(null);

  const allWordsList = useMemo(
    () => chaptersData.reduce<WordTerm[]>((acc, ch) => [...acc, ...ch.words], []),
    [chaptersData]
  );

  const dailyBonusId = useMemo(() => getDailyBonusWordId(todayKey, allWordsList), [allWordsList, todayKey]);

  const activeChapterObj: Chapter | undefined = isReviewMode
    ? reviewChapter ?? undefined
    : isDailyMode
    ? buildDailyChapter(allWordsList, todayKey)
    : chaptersData.find((c) => c.id === selectedChapterId);

  const handleSelectChapter = useCallback(
    (chapterId: string) => {
      setSelectedChapterId(chapterId);
      const chapter = chaptersData.find((c) => c.id === chapterId);
      if (!chapter) return;
      let startIndex = 0;
      const unsolvedIdx = chapter.words.findIndex((w) => !progress.solvedWordIds.includes(w.id));
      if (unsolvedIdx !== -1) startIndex = unsolvedIdx;
      setCurrentWordIndex(startIndex);
      setChapterRunStars([]);
      setChapterRunSolvedIds([]);
      setIsDailyMode(false);
      setIsReviewMode(false);
    },
    [chaptersData, progress.solvedWordIds]
  );

  const handleStartDailyChallenge = useCallback(() => {
    setSelectedChapterId("daily-challenge");
    setCurrentWordIndex(0);
    setChapterRunStars([]);
    setChapterRunSolvedIds([]);
    setIsDailyMode(true);
    setIsReviewMode(false);
    setExpertMode(false);
  }, []);

  const handleStartReview = useCallback(() => {
    const chapter = buildReviewChapter(progress.wordStats, allWordsList);
    if (chapter.words.length === 0) return false;
    setReviewChapter(chapter);
    setSelectedChapterId("review-session");
    setCurrentWordIndex(0);
    setChapterRunStars([]);
    setChapterRunSolvedIds([]);
    setIsDailyMode(false);
    setIsReviewMode(true);
    setExpertMode(false);
    return true;
  }, [allWordsList, progress.wordStats]);

  const handleWordSolveComplete = useCallback(
    (word: WordTerm, mistakesMade: number, hintsUsed: number) => {
      const stars = calcStars(mistakesMade, hintsUsed);
      let scriptureBonus: StudyPassage | null = null;
      let fragment: StudyPassage | null = null;
      let masteryUnlock: StudyPassage | null = null;

      const wordSolved = mistakesMade < getMaxMistakes(getWordDifficulty(word));
      const previewStats = recordWordAttempt(progress.wordStats, word.id, mistakesMade, wordSolved, hintsUsed);
      let nextFragments = [...(progress.fragmentIds ?? [])];

      if (wordSolved && stars === 3) {
        scriptureBonus = pickPerfectBonus();
        const chance = isDailyBonusWord(word.id, todayKey, allWordsList) ? 0.85 : 0.35;
        if (Math.random() < chance) {
          fragment = pickMysteryFragment(nextFragments);
          if (fragment) nextFragments = [...nextFragments, fragment.id];
        }
      }

      const chapter = chaptersData.find((c) => c.words.some((w) => w.id === word.id));
      if (chapter) {
        const mastery = getChapterMastery(chapter, previewStats);
        const prevTier = progress.masteryUnlocks?.[chapter.id] ?? 0;
        if (mastery.tier > prevTier && mastery.tier > 0) {
          const passage = CHAPTER_MASTERY_UNLOCKS[chapter.id]?.[mastery.tier as 25 | 50 | 100];
          if (passage) masteryUnlock = passage;
        }
      }

      setPendingScriptureBonus(scriptureBonus);
      setPendingFragment(fragment);
      setPendingMasteryUnlock(masteryUnlock);
      setSolvedWordState({ word, mistakes: mistakesMade, hintsUsed });
    },
    [allWordsList, chaptersData, progress, todayKey]
  );

  const clearSolveModal = useCallback(() => {
    setSolvedWordState(null);
    setPendingScriptureBonus(null);
    setPendingFragment(null);
    setPendingMasteryUnlock(null);
  }, []);

  const exitGameplay = useCallback(
    (toMenu: boolean) => {
      if (toMenu) {
        setIsDailyMode(false);
        setIsReviewMode(false);
        setReviewChapter(null);
      }
      setSelectedChapterId(null);
    },
    []
  );

  const handleProceedAfterSolve = useCallback(() => {
    if (!selectedChapterId || !solvedWordState) return { finished: false as const, toMenu: false as const };

    const chapter = isReviewMode
      ? reviewChapter
      : isDailyMode
      ? buildDailyChapter(allWordsList, todayKey)
      : chaptersData.find((c) => c.id === selectedChapterId);
    if (!chapter) return { finished: false as const, toMenu: false as const };

    const solvedWordId = solvedWordState.word.id;
    let updatedSolvedIds = [...progress.solvedWordIds];
    const mistakes = solvedWordState.mistakes;
    const hintsUsed = solvedWordState.hintsUsed;
    const wordMax = getMaxMistakes(getWordDifficulty(solvedWordState.word));
    const wordSolved = mistakes < wordMax;
    if (wordSolved && !updatedSolvedIds.includes(solvedWordId)) updatedSolvedIds.push(solvedWordId);
    const updatedWordStats = recordWordAttempt(progress.wordStats, solvedWordId, mistakes, wordSolved, hintsUsed);
    const wordStars = calcStars(mistakes, hintsUsed);
    const nextRunSolvedIds = appendRunSolvedWord(chapterRunSolvedIds, solvedWordId, wordSolved);
    setChapterRunSolvedIds(nextRunSolvedIds);
    const allRunStars = [...chapterRunStars, wordStars];
    setChapterRunStars(allRunStars);

    const isRunFinished = currentWordIndex >= chapter.words.length - 1;
    let updatedChapterStars = { ...progress.chapterStars };
    let nextProgress: UserProgress = {
      ...progress,
      solvedWordIds: updatedSolvedIds,
      chapterStars: updatedChapterStars,
      wordStats: updatedWordStats,
    };

    if (wordSolved && isDailyBonusWord(solvedWordId, todayKey, allWordsList)) {
      nextProgress.dailyBonusWordDate = todayKey;
      nextProgress.dailyBonusWordId = solvedWordId;
    }

    if (wordSolved && wordStars === 3) {
      if (pendingFragment && !(nextProgress.fragmentIds ?? []).includes(pendingFragment.id)) {
        const fragmentIds = [...(nextProgress.fragmentIds ?? []), pendingFragment.id];
        nextProgress.fragmentIds = fragmentIds;
        nextProgress.fragmentsComplete = fragmentIds.length >= FRAGMENTS_NEEDED;
      }
      nextProgress = awardPerfectWordXp(nextProgress).progress;
    }

    if (wordSolved) {
      const masteredChapter = chaptersData.find((c) => c.words.some((w) => w.id === solvedWordId));
      if (masteredChapter) {
        const mastery = getChapterMastery(masteredChapter, updatedWordStats);
        const prevTier = nextProgress.masteryUnlocks?.[masteredChapter.id] ?? 0;
        if (mastery.tier > prevTier && mastery.tier > 0) {
          nextProgress.masteryUnlocks = {
            ...(nextProgress.masteryUnlocks ?? {}),
            [masteredChapter.id]: mastery.tier,
          };
        }
      }
    }

    const dailyRunComplete = isDailyRunComplete(
      chapter.words.map((w) => w.id),
      nextRunSolvedIds
    );
    const chapterRunComplete = isChapterRunComplete(
      chapter.words.map((w) => w.id),
      updatedSolvedIds
    );

    if (isRunFinished && !isDailyMode && !isReviewMode && chapterRunComplete) {
      const avgStars = Math.round(allRunStars.reduce((a, b) => a + b, 0) / allRunStars.length);
      const chapterStars = Math.max(1, avgStars);
      const existingStars = updatedChapterStars[selectedChapterId] || 0;
      if (chapterStars > existingStars) {
        updatedChapterStars[selectedChapterId] = chapterStars;
        nextProgress.chapterStars = updatedChapterStars;
      }
      nextProgress = maybeEarnStreakFreeze(nextProgress);
    }

    if (isRunFinished && isDailyMode && dailyRunComplete) {
      nextProgress = applyDailyStreakComplete(nextProgress, todayKey);
      nextProgress = awardDailyCompleteXp(nextProgress).progress;
      const dailyScore = computeDailyScore(allRunStars);
      if (supabase && isSupabaseConfigured && isValidDailyScore(dailyScore, chapter.words.length)) {
        void (async () => {
          const { data } = await supabase.auth.getUser();
          if (data.user) {
            const result = await upsertDailyScore(data.user.id, todayKey, dailyScore);
            if (!result.ok) {
              logError("dailyScore.upsert", result.message);
              onRemoteError?.(
                mapUserFacingError(result.message, "Daily score could not be saved to the cloud")
              );
            }
          }
        })();
      }
    }

    saveProgress(nextProgress);
    clearSolveModal();

    if (isRunFinished) {
      playRoundEndSound();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#2a2018", "#92400e", "#b45309", "#F59E0B", "#10B981"],
      });
      const toMenu = isDailyMode || isReviewMode;
      exitGameplay(toMenu);
      return { finished: true as const, toMenu };
    }

    setCurrentWordIndex((prev) => prev + 1);
    return { finished: false as const, toMenu: false as const };
  }, [
    allWordsList,
    chapterRunSolvedIds,
    chapterRunStars,
    chaptersData,
    clearSolveModal,
    currentWordIndex,
    exitGameplay,
    isDailyMode,
    isReviewMode,
    onRemoteError,
    pendingFragment,
    progress,
    reviewChapter,
    saveProgress,
    selectedChapterId,
    solvedWordState,
    todayKey,
  ]);

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
    [progress, saveProgress, onRemoteError]
  );

  const handleViewStudyGuide = useCallback(() => {
    const result = awardStudyGuideXp(progress, todayKey);
    if (result.awarded > 0) saveProgress(result.progress);
    return result.awarded > 0;
  }, [progress, saveProgress, todayKey]);

  return {
    selectedChapterId,
    currentWordIndex,
    isDailyMode,
    isReviewMode,
    reviewChapter,
    expertMode,
    setExpertMode,
    solvedWordState,
    pendingScriptureBonus,
    pendingFragment,
    pendingMasteryUnlock,
    allWordsList,
    dailyBonusId,
    activeChapterObj,
    handleSelectChapter,
    handleStartDailyChallenge,
    handleStartReview,
    handleWordSolveComplete,
    handleProceedAfterSolve,
    handleSpeedRoundFinished,
    handleViewStudyGuide,
    clearSolveModal,
    exitGameplay,
  };
}
