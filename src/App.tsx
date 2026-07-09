import React, { useState, useEffect, useMemo } from "react";
import { Volume2, VolumeX, Flame, BookOpen } from "lucide-react";
import { chaptersData, WordTerm, allWordsList, Chapter } from "./data/words";
import { GameMode, UserProgress } from "./types";
import { CHAPTER_MASTERY_UNLOCKS, FRAGMENTS_NEEDED, pickMysteryFragment, pickPerfectBonus, StudyPassage } from "./data/studyContent";
import Dashboard from "./components/Dashboard";
import ChapterSelect from "./components/ChapterSelect";
import WordRevealGame from "./components/WordRevealGame";
import VerseLinkBonusModal from "./components/VerseLinkBonusModal";
import SpeedRoundGame from "./components/SpeedRoundGame";
import TeamsModeGame from "./components/TeamsModeGame";
import AboutStudyGuide from "./components/AboutStudyGuide";
import BadgesScreen from "./components/BadgesScreen";
import AuthScreen from "./components/AuthScreen";
import LeaderboardScreen from "./components/LeaderboardScreen";
import ShareCardScreen from "./components/ShareCardScreen";
import OnlineTeamsScreen from "./components/OnlineTeamsScreen";
import ScreenFlash from "./components/ScreenFlash";
import { calcStars, getMaxMistakes, getWordDifficulty, recordWordAttempt, buildReviewChapter, getChapterMastery } from "./utils/gameLogic";
import { buildDailyChapter, getTodayKey } from "./utils/dailyChallenge";
import { applyDailyStreakComplete, maybeEarnStreakFreeze, reconcileStreakOnLoad, getIsoWeekKey } from "./utils/streaks";
import { getDailyBonusWordId, isDailyBonusWord } from "./utils/rewards";
import { requestNotificationPermission, scheduleStreakReminder } from "./utils/notifications";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import confetti from "canvas-confetti";

const LOCAL_STORAGE_KEY = "last_day_words_progress_v1";

const DEFAULT_PROGRESS: UserProgress = {
  solvedWordIds: [],
  chapterStars: {},
  speedRoundHighScore: 0,
  speedRoundHighestWordsSolved: 0,
  totalTimePlayedSec: 0,
  soundEnabled: true,
  wordStats: {},
  streakFreezes: 0,
  earnedBadgeIds: [],
  masteryUnlocks: {},
  fragmentIds: [],
  notificationsEnabled: false,
};

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [currentMode, setCurrentMode] = useState<GameMode>("menu");
  const rm = useReducedMotion();
  const [expertMode, setExpertMode] = useState(false);

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [chapterRunStars, setChapterRunStars] = useState<number[]>([]);
  const [isDailyMode, setIsDailyMode] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewChapter, setReviewChapter] = useState<Chapter | null>(null);
  const todayKey = getTodayKey();

  const [solvedWordState, setSolvedWordState] = useState<{
    word: WordTerm;
    mistakes: number;
    hintsUsed: number;
  } | null>(null);
  const [pendingScriptureBonus, setPendingScriptureBonus] = useState<StudyPassage | null>(null);
  const [pendingFragment, setPendingFragment] = useState<StudyPassage | null>(null);
  const [pendingMasteryUnlock, setPendingMasteryUnlock] = useState<StudyPassage | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserProgress;
        setProgress(reconcileStreakOnLoad(parsed, todayKey));
      }
    } catch (e) {
      console.error("Failed to load user progress from localStorage:", e);
    }
  }, [todayKey]);

  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProgress));
    } catch (e) {
      console.error("Failed to save user progress to localStorage:", e);
    }
  };

  useEffect(() => {
    const streak = progress.dailyChallengeStreak ?? 0;
    const dailyDone = progress.dailyChallengeCompletedDate === todayKey;
    if (progress.notificationsEnabled && streak > 0 && !dailyDone) {
      return scheduleStreakReminder(streak, dailyDone);
    }
  }, [progress.notificationsEnabled, progress.dailyChallengeStreak, progress.dailyChallengeCompletedDate, todayKey]);

  const handleToggleSound = () => {
    saveProgress({ ...progress, soundEnabled: !progress.soundEnabled });
  };

  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    saveProgress({ ...progress, notificationsEnabled: perm === "granted" });
  };

  const handleResetProgress = () => {
    if (window.confirm("Are you absolutely sure you want to reset all solved words, star ratings, and high scores? This cannot be undone.")) {
      saveProgress(DEFAULT_PROGRESS);
      setCurrentMode("menu");
    }
  };

  const handleSelectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    const chapter = chaptersData.find((c) => c.id === chapterId);
    if (!chapter) return;
    let startIndex = 0;
    const unsolvedIdx = chapter.words.findIndex((w) => !progress.solvedWordIds.includes(w.id));
    if (unsolvedIdx !== -1) startIndex = unsolvedIdx;
    setCurrentWordIndex(startIndex);
    setChapterRunStars([]);
    setIsDailyMode(false);
    setIsReviewMode(false);
    setCurrentMode("gameplay");
  };

  const handleStartDailyChallenge = () => {
    setSelectedChapterId("daily-challenge");
    setCurrentWordIndex(0);
    setChapterRunStars([]);
    setIsDailyMode(true);
    setIsReviewMode(false);
    setExpertMode(false);
    setCurrentMode("gameplay");
  };

  const handleStartReview = () => {
    const chapter = buildReviewChapter(progress.wordStats);
    if (chapter.words.length === 0) return;
    setReviewChapter(chapter);
    setSelectedChapterId("review-session");
    setCurrentWordIndex(0);
    setChapterRunStars([]);
    setIsDailyMode(false);
    setIsReviewMode(true);
    setExpertMode(false);
    setCurrentMode("gameplay");
  };

  const handleWordSolveComplete = (word: WordTerm, mistakesMade: number, hintsUsed: number) => {
    const stars = calcStars(mistakesMade, hintsUsed);
    let scriptureBonus: StudyPassage | null = null;
    let fragment: StudyPassage | null = null;
    let masteryUnlock: StudyPassage | null = null;

    const wordSolved = mistakesMade < getMaxMistakes(getWordDifficulty(word));
    const previewStats = recordWordAttempt(progress.wordStats, word.id, mistakesMade, wordSolved, hintsUsed);
    let nextFragments = [...(progress.fragmentIds ?? [])];
    let fragmentsComplete = progress.fragmentsComplete ?? false;
    let masteryUnlocks = { ...(progress.masteryUnlocks ?? {}) };

    if (stars === 3) {
      scriptureBonus = pickPerfectBonus();
      const chance = isDailyBonusWord(word.id, todayKey) ? 0.85 : 0.35;
      if (Math.random() < chance) {
        fragment = pickMysteryFragment(nextFragments);
        if (fragment) {
          nextFragments = [...nextFragments, fragment.id];
          if (nextFragments.length >= FRAGMENTS_NEEDED) fragmentsComplete = true;
        }
      }
    }

    const chapter = chaptersData.find((c) => c.words.some((w) => w.id === word.id));
    if (chapter) {
      const mastery = getChapterMastery(chapter, previewStats);
      const prevTier = masteryUnlocks[chapter.id] ?? 0;
      if (mastery.tier > prevTier && mastery.tier > 0) {
        const passage = CHAPTER_MASTERY_UNLOCKS[chapter.id]?.[mastery.tier as 25 | 50 | 100];
        if (passage) {
          masteryUnlock = passage;
          masteryUnlocks = { ...masteryUnlocks, [chapter.id]: mastery.tier };
        }
      }
    }

    setPendingScriptureBonus(scriptureBonus);
    setPendingFragment(fragment);
    setPendingMasteryUnlock(masteryUnlock);
    // Persist reward side-effects now; word attempt is recorded once in handleProceedAfterSolve
    saveProgress({
      ...progress,
      fragmentIds: nextFragments,
      fragmentsComplete,
      masteryUnlocks,
      dailyBonusWordDate: isDailyBonusWord(word.id, todayKey) ? todayKey : progress.dailyBonusWordDate,
      dailyBonusWordId: isDailyBonusWord(word.id, todayKey) ? word.id : progress.dailyBonusWordId,
    });
    setSolvedWordState({ word, mistakes: mistakesMade, hintsUsed });
  };

  const handleProceedAfterSolve = () => {
    if (!selectedChapterId || !solvedWordState) return;

    const chapter = isReviewMode
      ? reviewChapter
      : isDailyMode
      ? buildDailyChapter(allWordsList, todayKey)
      : chaptersData.find((c) => c.id === selectedChapterId);
    if (!chapter) return;

    const solvedWordId = solvedWordState.word.id;
    let updatedSolvedIds = [...progress.solvedWordIds];
    if (!updatedSolvedIds.includes(solvedWordId)) updatedSolvedIds.push(solvedWordId);

    const mistakes = solvedWordState.mistakes;
    const hintsUsed = solvedWordState.hintsUsed;
    const wordMax = getMaxMistakes(getWordDifficulty(solvedWordState.word));
    const wordSolved = mistakes < wordMax;
    const updatedWordStats = recordWordAttempt(progress.wordStats, solvedWordId, mistakes, wordSolved, hintsUsed);
    const wordStars = calcStars(mistakes, hintsUsed);
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

    if (isRunFinished && !isDailyMode && !isReviewMode) {
      const avgStars = Math.round(allRunStars.reduce((a, b) => a + b, 0) / allRunStars.length);
      const chapterStars = Math.max(1, avgStars);
      const existingStars = updatedChapterStars[selectedChapterId!] || 0;
      if (chapterStars > existingStars) {
        updatedChapterStars[selectedChapterId!] = chapterStars;
        nextProgress.chapterStars = updatedChapterStars;
      }
      nextProgress = maybeEarnStreakFreeze(nextProgress);
    }

    if (isRunFinished && isDailyMode) {
      nextProgress = applyDailyStreakComplete(nextProgress, todayKey);
    }

    saveProgress(nextProgress);
    setSolvedWordState(null);
    setPendingScriptureBonus(null);
    setPendingFragment(null);
    setPendingMasteryUnlock(null);

    if (isRunFinished) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#2a2018", "#92400e", "#b45309", "#F59E0B", "#10B981"],
      });
      if (isDailyMode || isReviewMode) {
        setCurrentMode("menu");
        setSelectedChapterId(null);
        setIsDailyMode(false);
        setIsReviewMode(false);
        setReviewChapter(null);
      } else {
        setCurrentMode("chapter-select");
        setSelectedChapterId(null);
      }
    } else {
      setCurrentWordIndex((prev) => prev + 1);
    }
  };

  const handleSpeedRoundFinished = async (finalScore: number, solvedCount: number) => {
    let updatedHighScore = progress.speedRoundHighScore;
    let updatedSolvedMax = progress.speedRoundHighestWordsSolved;
    if (finalScore > progress.speedRoundHighScore) updatedHighScore = finalScore;
    if (solvedCount > progress.speedRoundHighestWordsSolved) updatedSolvedMax = solvedCount;
    saveProgress({
      ...progress,
      speedRoundHighScore: updatedHighScore,
      speedRoundHighestWordsSolved: updatedSolvedMax,
    });

    if (supabase && isSupabaseConfigured) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const week = getIsoWeekKey();
        await supabase.from("speed_scores").upsert(
          {
            user_id: userData.user.id,
            week_key: week,
            score: finalScore,
            words_solved: solvedCount,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,week_key" }
        );
      }
    }
  };

  const activeChapterObj: Chapter | undefined = isReviewMode
    ? reviewChapter ?? undefined
    : isDailyMode
    ? buildDailyChapter(allWordsList, todayKey)
    : chaptersData.find((c) => c.id === selectedChapterId);

  const dailyBonusId = useMemo(() => getDailyBonusWordId(todayKey), [todayKey]);

  const routeProps = (variant: "y" | "scale") => {
    if (rm) {
      return {
        initial: false as const,
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      };
    }
    return variant === "y"
      ? {
          initial: { opacity: 0, y: 15 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -15 },
          transition: { duration: 0.25 },
        }
      : {
          initial: { opacity: 0, scale: 0.98 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.98 },
          transition: { duration: 0.25 },
        };
  };

  return (
    <div className="min-h-screen candlelit-page text-[#2a2018] font-sans flex flex-col justify-between">
      <ScreenFlash />
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
        <header className="flex items-center justify-between gap-3 py-4 mb-6 pcard px-4 md:px-6 rounded-2xl parchment-glow">
          <div
            role="button"
            tabIndex={0}
            aria-label="Return to home menu"
            onClick={() => setCurrentMode("menu")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setCurrentMode("menu");
              }
            }}
            className="flex items-center gap-3 cursor-pointer group rounded-lg"
          >
            <div className="w-9 h-9 bg-[#2a2018] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 border border-[#b45309]/40 shadow-[0_0_14px_-2px_rgba(180,83,9,0.5)]">
              <Flame className="w-4 h-4 text-[#fbbf24]" aria-hidden="true" />
            </div>
            <div>
              <span className="text-lg font-display font-bold tracking-[0.12em] text-[#2a2018]">LAST DAY WORDS</span>
              <p className="text-[9px] text-[#6b5537] uppercase tracking-[0.2em] font-semibold leading-none">SDA Prophetic Puzzle</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleToggleSound}
              aria-label={progress.soundEnabled ? "Mute interactive signals" : "Unmute interactive signals"}
              aria-pressed={progress.soundEnabled}
              className="p-2 bg-[#fbf5e9] hover:bg-[#f3e8cf] text-[#2a2018] rounded-lg border border-[#e2d2ac] cursor-pointer transition-colors"
            >
              {progress.soundEnabled ? <Volume2 className="w-4 h-4" aria-hidden="true" /> : <VolumeX className="w-4 h-4 text-[#6b5537]" aria-hidden="true" />}
            </button>
            {currentMode !== "stats-help" && (
              <button
                onClick={() => setCurrentMode("stats-help")}
                className="flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 bg-[#fbf5e9] hover:bg-[#f3e8cf] text-[#2a2018] rounded-lg border border-[#e2d2ac] cursor-pointer transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Study Guide</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {currentMode === "menu" && (
              <motion.div key="menu" {...routeProps("y")}>
                <Dashboard
                  progress={progress}
                  dailyBonusWordId={dailyBonusId}
                  onStartChapters={() => setCurrentMode("chapter-select")}
                  onStartDailyChallenge={handleStartDailyChallenge}
                  onStartSpeedRound={() => setCurrentMode("speed-round")}
                  onStartTeamsMode={() => setCurrentMode("teams-mode")}
                  onStartOnlineTeams={() => setCurrentMode("online-teams")}
                  onStartReview={handleStartReview}
                  onViewStudyGuide={() => setCurrentMode("stats-help")}
                  onViewBadges={() => setCurrentMode("badges")}
                  onViewAuth={() => setCurrentMode("auth")}
                  onViewLeaderboard={() => setCurrentMode("leaderboard")}
                  onViewShareCard={() => setCurrentMode("share-card")}
                  onEnableNotifications={handleEnableNotifications}
                  onResetProgress={handleResetProgress}
                />
              </motion.div>
            )}

            {currentMode === "chapter-select" && (
              <motion.div key="chapters" {...routeProps("y")}>
                <ChapterSelect
                  progress={progress}
                  expertMode={expertMode}
                  onExpertModeChange={setExpertMode}
                  onSelectChapter={handleSelectChapter}
                  onBack={() => setCurrentMode("menu")}
                />
              </motion.div>
            )}

            {currentMode === "gameplay" && activeChapterObj && (
              <motion.div key="gameplay" {...routeProps("scale")}>
                <WordRevealGame
                  chapter={activeChapterObj}
                  wordIndex={currentWordIndex}
                  expertMode={expertMode && !isDailyMode && !isReviewMode}
                  onBack={() => {
                    if (isDailyMode || isReviewMode) {
                      setCurrentMode("menu");
                      setIsDailyMode(false);
                      setIsReviewMode(false);
                      setReviewChapter(null);
                    } else {
                      setCurrentMode("chapter-select");
                    }
                    setSelectedChapterId(null);
                  }}
                  onSolveComplete={handleWordSolveComplete}
                />
              </motion.div>
            )}

            {currentMode === "teams-mode" && (
              <motion.div key="teams-mode" {...routeProps("scale")}>
                <TeamsModeGame onBack={() => setCurrentMode("menu")} />
              </motion.div>
            )}

            {currentMode === "online-teams" && (
              <motion.div key="online-teams" {...routeProps("y")}>
                <OnlineTeamsScreen onBack={() => setCurrentMode("menu")} />
              </motion.div>
            )}

            {currentMode === "speed-round" && (
              <motion.div key="speed-round" {...routeProps("scale")}>
                <SpeedRoundGame
                  highScore={progress.speedRoundHighScore}
                  highestWordsSolved={progress.speedRoundHighestWordsSolved}
                  onGameFinished={handleSpeedRoundFinished}
                  onBack={() => setCurrentMode("menu")}
                />
              </motion.div>
            )}

            {currentMode === "stats-help" && (
              <motion.div key="help" {...routeProps("y")}>
                <AboutStudyGuide onBack={() => setCurrentMode("menu")} />
              </motion.div>
            )}

            {currentMode === "badges" && (
              <motion.div key="badges" {...routeProps("y")}>
                <BadgesScreen progress={progress} onBack={() => setCurrentMode("menu")} />
              </motion.div>
            )}

            {currentMode === "auth" && (
              <motion.div key="auth" {...routeProps("y")}>
                <AuthScreen
                  onBack={() => setCurrentMode("menu")}
                  onAuthed={(name) => saveProgress({ ...progress, displayName: name })}
                />
              </motion.div>
            )}

            {currentMode === "leaderboard" && (
              <motion.div key="leaderboard" {...routeProps("y")}>
                <LeaderboardScreen onBack={() => setCurrentMode("menu")} />
              </motion.div>
            )}

            {currentMode === "share-card" && (
              <motion.div key="share" {...routeProps("y")}>
                <ShareCardScreen progress={progress} onBack={() => setCurrentMode("menu")} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {solvedWordState && activeChapterObj && (
          <VerseLinkBonusModal
            word={solvedWordState.word}
            mistakes={solvedWordState.mistakes}
            hintsUsed={solvedWordState.hintsUsed}
            chapterTitle={activeChapterObj.title}
            isLastWord={currentWordIndex >= activeChapterObj.words.length - 1}
            isDailyBonus={isDailyBonusWord(solvedWordState.word.id, todayKey)}
            scriptureBonus={pendingScriptureBonus}
            fragment={pendingFragment}
            masteryUnlock={pendingMasteryUnlock}
            onNext={handleProceedAfterSolve}
            onRetry={() => {
              setSolvedWordState(null);
              setPendingScriptureBonus(null);
              setPendingFragment(null);
              setPendingMasteryUnlock(null);
            }}
          />
        )}
      </AnimatePresence>

      <footer className="w-full text-center py-6 px-4 text-[11px] text-[#6b5537] border-t border-[#e2d2ac] bg-[#f3e8cf]/70 mt-6">
        <p className="font-scripture italic text-[15px] text-[#52412c] mb-1.5 leading-relaxed">
          “Write the vision, and make it plain upon tables, that he may run that readeth it.” — Habakkuk 2:2
        </p>
        <p className="font-sans font-medium text-[#6b5537]">
          Last Day Words • Inspired by Biblical Prophecy &amp; Last Day Events • Sabbath Devotion Companion
        </p>
      </footer>
    </div>
  );
}
