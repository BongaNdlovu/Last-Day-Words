import { useState, useEffect, lazy, Suspense } from "react";
import { Volume2, VolumeX, Flame, BookOpen, LogIn, UserRound } from "lucide-react";
import { DEFAULT_CANDLE_ID } from "./data/cosmetics";
import { GameMode, UserProgress } from "./types";
import ScreenFlash from "./components/ScreenFlash";
import AppNoticeStack from "./components/AppNoticeStack";
import ErrorBoundary from "./components/ErrorBoundary";
import { LoadingBlock } from "./components/ErrorState";
import { requestNotificationPermission } from "./utils/notifications";
import { selectCosmetic } from "./utils/progression";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { isDailyBonusWord } from "./utils/rewards";
import { useTodayKey } from "./hooks/useTodayKey";
import { useUserProgress } from "./hooks/useUserProgress";
import { useContentCatalog } from "./hooks/useContentCatalog";
import { useStreakReminder } from "./hooks/useStreakReminder";
import { useGameSession } from "./hooks/useGameSession";
import { useAuth } from "./hooks/useAuth";
import { useNoticeQueue } from "./hooks/useNoticeQueue";
import { playButtonSfxForEventTarget, setGameSoundsEnabled } from "./utils/sounds";

const Dashboard = lazy(() => import("./components/Dashboard"));
const ChapterSelect = lazy(() => import("./components/ChapterSelect"));
const WordRevealGame = lazy(() => import("./components/WordRevealGame"));
const VerseLinkBonusModal = lazy(() => import("./components/VerseLinkBonusModal"));
const SpeedRoundGame = lazy(() => import("./components/SpeedRoundGame"));
const TeamsModeGame = lazy(() => import("./components/TeamsModeGame"));
const AboutStudyGuide = lazy(() => import("./components/AboutStudyGuide"));
const BadgesScreen = lazy(() => import("./components/BadgesScreen"));
const AuthScreen = lazy(() => import("./components/AuthScreen"));
const LeaderboardScreen = lazy(() => import("./components/LeaderboardScreen"));
const ShareCardScreen = lazy(() => import("./components/ShareCardScreen"));
const OnlineTeamsScreen = lazy(() => import("./components/OnlineTeamsScreen"));

function ScreenFallback() {
  return <LoadingBlock label="Loading screen…" />;
}

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
  xp: 0,
  rank: "novice",
  unlockedCosmetics: ["candle-classic"],
  selectedCandle: DEFAULT_CANDLE_ID,
  selectedBanner: "",
};

export default function App() {
  const todayKey = useTodayKey();
  const notices = useNoticeQueue();
  const { progress, saveProgress } = useUserProgress(DEFAULT_PROGRESS, todayKey, (n) => {
    notices.pushNotice({
      tone: n.tone,
      message: n.message,
      autoDismissMs: n.sticky === false ? 7000 : n.tone === "error" ? 0 : 8000,
    });
  });
  const { chaptersData, seasons, wordOfTheWeek, featuredAnnouncement } = useContentCatalog();
  const auth = useAuth();
  useStreakReminder(progress, todayKey);

  const [currentMode, setCurrentMode] = useState<GameMode>("menu");
  const rm = useReducedMotion();

  const session = useGameSession(progress, saveProgress, chaptersData, todayKey, (message) => {
    notices.pushError(message, true);
  });
  const candleStyle = progress.selectedCandle ?? DEFAULT_CANDLE_ID;

  useEffect(() => {
    setGameSoundsEnabled(progress.soundEnabled !== false);
  }, [progress.soundEnabled]);

  // Soft click SFX for UI buttons (letter keyboard is opted out via data-no-button-sfx).
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      playButtonSfxForEventTarget(e.target);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  const handleToggleSound = () => {
    saveProgress({ ...progress, soundEnabled: !progress.soundEnabled });
  };

  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    saveProgress({ ...progress, notificationsEnabled: perm === "granted" });
  };

  const handleResetProgress = () => {
    if (
      window.confirm(
        "Are you absolutely sure you want to reset all solved words, star ratings, and high scores? This cannot be undone."
      )
    ) {
      saveProgress(DEFAULT_PROGRESS);
      setCurrentMode("menu");
    }
  };

  const handleSelectChapter = (chapterId: string) => {
    session.handleSelectChapter(chapterId);
    setCurrentMode("gameplay");
  };

  const handleStartDailyChallenge = () => {
    session.handleStartDailyChallenge();
    setCurrentMode("gameplay");
  };

  const handleStartReview = () => {
    if (session.handleStartReview()) setCurrentMode("gameplay");
  };

  const handleProceedAfterSolve = () => {
    const result = session.handleProceedAfterSolve();
    if (result.finished) {
      setCurrentMode(result.toMenu ? "menu" : "chapter-select");
    }
  };

  const handleViewStudyGuide = () => {
    session.handleViewStudyGuide();
    setCurrentMode("stats-help");
  };

  const handleSelectCosmetic = (cosmeticId: string) => {
    saveProgress(selectCosmetic(progress, cosmeticId));
  };

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
      <AppNoticeStack notices={notices.notices} onDismiss={notices.dismissNotice} />
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
              type="button"
              onClick={() => setCurrentMode("auth")}
              aria-label={auth.isSignedIn ? `Account: ${auth.user?.displayName}` : "Sign in or create account"}
              className="flex items-center gap-1.5 text-xs font-semibold py-2 px-2.5 sm:px-3.5 bg-[#fbf5e9] hover:bg-[#f3e8cf] text-[#2a2018] rounded-lg border border-[#e2d2ac] cursor-pointer transition-colors max-w-[10rem] sm:max-w-none"
            >
              {auth.isSignedIn ? (
                <UserRound className="w-3.5 h-3.5 shrink-0 text-[#b45309]" aria-hidden="true" />
              ) : (
                <LogIn className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              <span className="hidden sm:inline truncate">
                {auth.loading ? "…" : auth.isSignedIn ? auth.user?.displayName : "Sign In"}
              </span>
            </button>
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
                onClick={handleViewStudyGuide}
                className="flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 bg-[#fbf5e9] hover:bg-[#f3e8cf] text-[#2a2018] rounded-lg border border-[#e2d2ac] cursor-pointer transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Study Guide</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-center">
          <ErrorBoundary name="screen">
          <Suspense fallback={<ScreenFallback />}>
          <AnimatePresence mode="wait">
            {currentMode === "menu" && (
              <motion.div key="menu" {...routeProps("y")}>
                <Dashboard
                  progress={progress}
                  chapters={chaptersData}
                  dailyBonusWordId={session.dailyBonusId}
                  wordOfTheWeek={wordOfTheWeek}
                  featuredAnnouncement={featuredAnnouncement}
                  seasons={seasons}
                  authSignedIn={auth.isSignedIn}
                  authDisplayName={auth.user?.displayName ?? null}
                  authLoading={auth.loading}
                  onStartChapters={() => setCurrentMode("chapter-select")}
                  onStartDailyChallenge={handleStartDailyChallenge}
                  onStartSpeedRound={() => setCurrentMode("speed-round")}
                  onStartTeamsMode={() => setCurrentMode("teams-mode")}
                  onStartOnlineTeams={() => setCurrentMode("online-teams")}
                  onStartReview={handleStartReview}
                  onViewStudyGuide={handleViewStudyGuide}
                  onViewBadges={() => setCurrentMode("badges")}
                  onViewAuth={() => setCurrentMode("auth")}
                  onViewLeaderboard={() => setCurrentMode("leaderboard")}
                  onViewShareCard={() => setCurrentMode("share-card")}
                  onEnableNotifications={handleEnableNotifications}
                  onResetProgress={handleResetProgress}
                  onSelectCosmetic={handleSelectCosmetic}
                />
              </motion.div>
            )}

            {currentMode === "chapter-select" && (
              <motion.div key="chapters" {...routeProps("y")}>
                <ChapterSelect
                  progress={progress}
                  chapters={chaptersData}
                  seasons={seasons}
                  expertMode={session.expertMode}
                  onExpertModeChange={session.setExpertMode}
                  onSelectChapter={handleSelectChapter}
                  onBack={() => setCurrentMode("menu")}
                />
              </motion.div>
            )}

            {currentMode === "gameplay" && session.activeChapterObj && (
              <motion.div key="gameplay" {...routeProps("scale")}>
                <WordRevealGame
                  chapter={session.activeChapterObj}
                  wordIndex={session.currentWordIndex}
                  expertMode={session.expertMode && !session.isDailyMode && !session.isReviewMode}
                  candleStyle={candleStyle}
                  onBack={() => {
                    if (session.isDailyMode || session.isReviewMode) {
                      setCurrentMode("menu");
                      session.exitGameplay(true);
                    } else {
                      setCurrentMode("chapter-select");
                      session.exitGameplay(false);
                    }
                  }}
                  onSolveComplete={session.handleWordSolveComplete}
                />
              </motion.div>
            )}

            {currentMode === "teams-mode" && (
              <motion.div key="teams-mode" {...routeProps("scale")}>
                <TeamsModeGame chapters={chaptersData} onBack={() => setCurrentMode("menu")} />
              </motion.div>
            )}

            {currentMode === "online-teams" && (
              <motion.div key="online-teams" {...routeProps("y")}>
                <OnlineTeamsScreen chapters={chaptersData} onBack={() => setCurrentMode("menu")} />
              </motion.div>
            )}

            {currentMode === "speed-round" && (
              <motion.div key="speed-round" {...routeProps("scale")}>
                <SpeedRoundGame
                  highScore={progress.speedRoundHighScore}
                  highestWordsSolved={progress.speedRoundHighestWordsSolved}
                  chapters={chaptersData}
                  candleStyle={candleStyle}
                  onGameFinished={session.handleSpeedRoundFinished}
                  onBack={() => setCurrentMode("menu")}
                />
              </motion.div>
            )}

            {currentMode === "stats-help" && (
              <motion.div key="help" {...routeProps("y")}>
                <AboutStudyGuide chapters={chaptersData} onBack={() => setCurrentMode("menu")} />
              </motion.div>
            )}

            {currentMode === "badges" && (
              <motion.div key="badges" {...routeProps("y")}>
                <BadgesScreen
                  progress={progress}
                  onSelectCosmetic={handleSelectCosmetic}
                  onBack={() => setCurrentMode("menu")}
                />
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
          </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <Suspense fallback={null}>
      <AnimatePresence>
        {session.solvedWordState && session.activeChapterObj && (
          <VerseLinkBonusModal
            word={session.solvedWordState.word}
            mistakes={session.solvedWordState.mistakes}
            hintsUsed={session.solvedWordState.hintsUsed}
            chapterTitle={session.activeChapterObj.title}
            isLastWord={session.currentWordIndex >= session.activeChapterObj.words.length - 1}
            isDailyBonus={isDailyBonusWord(session.solvedWordState.word.id, todayKey, session.allWordsList)}
            scriptureBonus={session.pendingScriptureBonus}
            fragment={session.pendingFragment}
            masteryUnlock={session.pendingMasteryUnlock}
            onNext={handleProceedAfterSolve}
            onRetry={session.clearSolveModal}
          />
        )}
      </AnimatePresence>
      </Suspense>

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
