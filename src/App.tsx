import { useState, useEffect, useMemo, Suspense } from "react";
import { Volume2, VolumeX, Flame, BookOpen, LogIn, UserRound, ArrowLeft } from "lucide-react";
import { DEFAULT_CANDLE_ID } from "./data/cosmetics";
import { GameMode, UserProgress } from "./types";
import ScreenFlash from "./components/ScreenFlash";
import AppNoticeStack from "./components/AppNoticeStack";
import ErrorBoundary from "./components/ErrorBoundary";
import { EmptyState, LoadingBlock } from "./components/ErrorState";
import { requestNotificationPermission } from "./utils/notifications";
import { selectCosmetic } from "./utils/progression";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useTodayKey } from "./hooks/useTodayKey";
import { useUserProgress } from "./hooks/useUserProgress";
import { useContentCatalog } from "./hooks/useContentCatalog";
import { useStreakReminder } from "./hooks/useStreakReminder";
import { useGameSession } from "./hooks/useGameSession";
import { useAuth } from "./hooks/useAuth";
import { useNoticeQueue } from "./hooks/useNoticeQueue";
import { playButtonSfxForEventTarget, setGameSoundsEnabled } from "./utils/sounds";
import {
  getChapterSpeedChapters,
  getChapterSpeedWords,
  getMixedSpeedWords,
  type SpeedBoardMode,
} from "./utils/speedPools";
import { buildIntroWordPool, needsSpeedIntro } from "./utils/speedIntro";
import { lazyRetry } from "./utils/lazyRetry";

const Dashboard = lazyRetry(() => import("./components/Dashboard"));
const SpeedRoundGame = lazyRetry(() => import("./components/SpeedRoundGame"));
const TeamsModeGame = lazyRetry(() => import("./components/TeamsModeGame"));
const AboutStudyGuide = lazyRetry(() => import("./components/AboutStudyGuide"));
const BadgesScreen = lazyRetry(() => import("./components/BadgesScreen"));
const AuthScreen = lazyRetry(() => import("./components/AuthScreen"));
const LeaderboardScreen = lazyRetry(() => import("./components/LeaderboardScreen"));
const ShareCardScreen = lazyRetry(() => import("./components/ShareCardScreen"));
const OnlineTeamsScreen = lazyRetry(() => import("./components/OnlineTeamsScreen"));
const OnboardingTutorial = lazyRetry(() => import("./components/OnboardingTutorial"));

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
  const { chaptersData, wordOfTheWeek, featuredAnnouncement } = useContentCatalog();
  const auth = useAuth();
  useStreakReminder(progress, todayKey);

  const [currentMode, setCurrentMode] = useState<GameMode>("menu");
  const [speedBoardMode, setSpeedBoardMode] = useState<SpeedBoardMode>("mixed");
  const [speedChapterId, setSpeedChapterId] = useState<string | null>(null);
  const rm = useReducedMotion();

  const session = useGameSession(progress, saveProgress, chaptersData, todayKey, (message) => {
    notices.pushError(message, true);
  });
  const candleStyle = progress.selectedCandle ?? DEFAULT_CANDLE_ID;

  const chapterSpeedChapters = useMemo(
    () => getChapterSpeedChapters(chaptersData),
    [chaptersData]
  );

  const speedIntroActive = needsSpeedIntro(progress, speedBoardMode);

  const speedWords = useMemo(() => {
    const base =
      speedBoardMode === "mixed"
        ? getMixedSpeedWords(chaptersData)
        : speedChapterId
          ? getChapterSpeedWords(chaptersData, speedChapterId)
          : [];
    if (base.length === 0) return base;
    return speedIntroActive ? buildIntroWordPool(base) : base;
  }, [chaptersData, speedBoardMode, speedChapterId, speedIntroActive]);

  const speedPoolLabel = useMemo(() => {
    if (speedBoardMode === "mixed") return "Mixed expansion pool";
    const ch = chaptersData.find((c) => c.id === speedChapterId);
    return ch?.title ?? "Chapter";
  }, [chaptersData, speedBoardMode, speedChapterId]);

  const speedHighScore =
    speedBoardMode === "mixed"
      ? (progress.speedMixedHighScore ?? progress.speedRoundHighScore)
      : (progress.speedChapterHighScore ?? 0);
  const speedHighestWords =
    speedBoardMode === "mixed"
      ? (progress.speedMixedHighestWordsSolved ?? progress.speedRoundHighestWordsSolved)
      : (progress.speedChapterHighestWordsSolved ?? 0);

  const startMixedSpeed = () => {
    setSpeedBoardMode("mixed");
    setSpeedChapterId(null);
    setCurrentMode("speed-round");
  };

  const startChapterSpeedSelect = () => {
    setSpeedBoardMode("chapter");
    setSpeedChapterId(null);
    setCurrentMode("speed-chapter-select");
  };

  const startChapterSpeed = (chapterId: string) => {
    setSpeedBoardMode("chapter");
    setSpeedChapterId(chapterId);
    setCurrentMode("speed-round");
  };

  useEffect(() => {
    setGameSoundsEnabled(progress.soundEnabled !== false);
  }, [progress.soundEnabled]);

  // Landing from a reset-password email must surface the set-new-password form.
  useEffect(() => {
    if (auth.passwordRecovery) setCurrentMode("auth");
  }, [auth.passwordRecovery]);

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
        "Are you absolutely sure you want to reset all high scores, streak, and progress? This cannot be undone."
      )
    ) {
      saveProgress(DEFAULT_PROGRESS);
      setCurrentMode("menu");
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
    <div className="min-h-screen candlelit-page text-[#f4f1ea] font-sans flex flex-col justify-between">
      <video
        className="bg-video"
        src="/bg-loop.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
      />
      <div className="bg-video-veil" aria-hidden="true" />
      <div className="bg-grain" aria-hidden="true" />
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
            <div className="w-9 h-9 bg-[#101014] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 border border-[#f5b301]/40 shadow-[0_0_14px_-2px_rgba(180,83,9,0.5)]">
              <Flame className="w-4 h-4 text-[#fbbf24]" aria-hidden="true" />
            </div>
            <div>
              <span className="text-lg font-display font-bold tracking-[0.12em] text-[#f4f1ea]">
                LAST DAY WORDS
              </span>
              <p className="text-[9px] text-[#a49b8d] uppercase tracking-[0.2em] font-semibold leading-none">
                Prophetic Speed Arcade
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setCurrentMode("auth")}
              aria-label={
                auth.isSignedIn ? `Account: ${auth.user?.displayName}` : "Sign in or create account"
              }
              className="flex items-center gap-1.5 text-xs font-semibold py-2 px-2.5 sm:px-3.5 bg-white/[0.06] hover:bg-white/10 text-[#f4f1ea] rounded-lg border border-white/10 cursor-pointer transition-colors max-w-[10rem] sm:max-w-none"
            >
              {auth.isSignedIn ? (
                <UserRound className="w-3.5 h-3.5 shrink-0 text-[#f5b301]" aria-hidden="true" />
              ) : (
                <LogIn className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              <span className="hidden sm:inline truncate">
                {auth.loading ? "…" : auth.isSignedIn ? auth.user?.displayName : "Sign In"}
              </span>
            </button>
            <button
              onClick={handleToggleSound}
              aria-label={
                progress.soundEnabled ? "Mute interactive signals" : "Unmute interactive signals"
              }
              aria-pressed={progress.soundEnabled}
              className="p-2 bg-white/[0.06] hover:bg-white/10 text-[#f4f1ea] rounded-lg border border-white/10 cursor-pointer transition-colors"
            >
              {progress.soundEnabled ? (
                <Volume2 className="w-4 h-4" aria-hidden="true" />
              ) : (
                <VolumeX className="w-4 h-4 text-[#a49b8d]" aria-hidden="true" />
              )}
            </button>
            {currentMode !== "stats-help" && (
              <button
                onClick={handleViewStudyGuide}
                className="flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 bg-white/[0.06] hover:bg-white/10 text-[#f4f1ea] rounded-lg border border-white/10 cursor-pointer transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Word Bank</span>
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
                    {!progress.onboardingComplete && (
                      <OnboardingTutorial
                        onComplete={() =>
                          saveProgress({ ...progress, onboardingComplete: true })
                        }
                      />
                    )}
                    <Dashboard
                      progress={progress}
                      chapters={chaptersData}
                      wordOfTheWeek={wordOfTheWeek}
                      featuredAnnouncement={featuredAnnouncement}
                      authSignedIn={auth.isSignedIn}
                      authDisplayName={auth.user?.displayName ?? null}
                      authLoading={auth.loading}
                      onStartMixedSpeed={startMixedSpeed}
                      onStartChapterSpeed={startChapterSpeedSelect}
                      onStartTeamsMode={() => setCurrentMode("teams-mode")}
                      onStartOnlineTeams={() => setCurrentMode("online-teams")}
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

                {currentMode === "speed-chapter-select" && (
                  <motion.div key="speed-chapter-select" {...routeProps("y")}>
                    <div className="max-w-lg mx-auto space-y-4 py-2 px-2">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <button
                          type="button"
                          onClick={() => setCurrentMode("menu")}
                          className="flex items-center gap-1.5 text-sm text-[#c9c2b4] font-medium cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
                        </button>
                        <h2 className="text-lg font-display font-bold tracking-[0.08em] text-[#f4f1ea]">
                          CHAPTER SPEED
                        </h2>
                        <div className="w-12" />
                      </div>
                      <p className="text-sm text-[#c9c2b4] text-center">
                        Core prophecy tracks only — separate from the Mixed pool.
                      </p>
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                        {chapterSpeedChapters.map((ch) => (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => startChapterSpeed(ch.id)}
                            className="w-full pcard rounded-xl px-4 py-3 text-left hover:border-[#f5b301] cursor-pointer"
                          >
                            <div className="font-bold text-[#f4f1ea]">{ch.title}</div>
                            <div className="text-xs text-[#a49b8d] mt-0.5">
                              {ch.words.length} terms · {ch.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
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

                {currentMode === "speed-round" && speedWords.length === 0 && (
                  <motion.div key="speed-round-empty" {...routeProps("y")}>
                    <EmptyState
                      title="Speed pool unavailable"
                      message="This board has no words loaded yet. Try again from the menu, or reload if you just updated the app."
                      icon="alert"
                      actionLabel="Back to menu"
                      onAction={() => setCurrentMode("menu")}
                    />
                  </motion.div>
                )}

                {currentMode === "speed-round" && speedWords.length > 0 && (
                  <motion.div
                    key={`speed-round-${speedBoardMode}-${speedChapterId ?? "mixed"}-${speedIntroActive ? "intro" : "full"}`}
                    {...routeProps("scale")}
                  >
                    <SpeedRoundGame
                      highScore={speedHighScore}
                      highestWordsSolved={speedHighestWords}
                      words={speedWords}
                      mode={speedBoardMode}
                      poolLabel={
                        speedIntroActive ? `${speedPoolLabel} · practice` : speedPoolLabel
                      }
                      introMode={speedIntroActive}
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
                      recoveryMode={auth.passwordRecovery}
                      onRecoveryDone={auth.clearPasswordRecovery}
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

      <footer className="w-full text-center py-6 px-4 text-[11px] text-[#a49b8d] border-t border-white/10 bg-black/45 mt-6">
        <p className="font-scripture italic text-[15px] text-[#d7d1c5] mb-1.5 leading-relaxed">
          “Write the vision, and make it plain upon tables, that he may run that readeth it.” —
          Habakkuk 2:2
        </p>
        <p className="font-sans font-medium text-[#a49b8d]">
          Last Day Words • Prophetic Speed Arcade • Weekly Board
        </p>
      </footer>
    </div>
  );
}
