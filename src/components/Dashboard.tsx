import {
  BookOpen,
  Trophy,
  Award,
  Flame,
  Play,
  HelpCircle,
  Sparkles,
  Users,
  Calendar,
  RotateCcw,
  Bell,
  Share2,
  Medal,
  LogIn,
  Snowflake,
  Puzzle,
  Star,
} from "lucide-react";
import { Season, UserProgress } from "../types";
import { Chapter, WordTerm } from "../data/words";
import { getReviewWordIds } from "../utils/gameLogic";
import { getTodayKey } from "../utils/dailyChallenge";
import { STREAK_MILESTONES, milestoneTitle } from "../utils/streaks";
import { FRAGMENTS_NEEDED } from "../data/studyContent";
import { progressToNextRank } from "../data/ranks";
import { COSMETICS } from "../data/cosmetics";
import { motion, useReducedMotion } from "motion/react";
import EllenWhiteAvatar from "./EllenWhiteAvatar";

interface DashboardProps {
  progress: UserProgress;
  chapters: Chapter[];
  dailyBonusWordId: string;
  wordOfTheWeek?: WordTerm | null;
  featuredAnnouncement?: string | null;
  seasons?: Season[];
  onStartChapters: () => void;
  onStartDailyChallenge: () => void;
  onStartSpeedRound: () => void;
  onStartTeamsMode: () => void;
  onStartOnlineTeams: () => void;
  onStartReview: () => void;
  onViewStudyGuide: () => void;
  onViewBadges: () => void;
  onViewAuth: () => void;
  onViewLeaderboard: () => void;
  onViewShareCard: () => void;
  onEnableNotifications: () => void;
  onResetProgress: () => void;
  onSelectCosmetic?: (cosmeticId: string) => void;
  /** Cloud account (Supabase) — optional offline play when false. */
  authSignedIn?: boolean;
  authDisplayName?: string | null;
  authLoading?: boolean;
}

export default function Dashboard({
  progress,
  chapters,
  dailyBonusWordId,
  wordOfTheWeek,
  featuredAnnouncement,
  seasons = [],
  onStartChapters,
  onStartDailyChallenge,
  onStartSpeedRound,
  onStartTeamsMode,
  onStartOnlineTeams,
  onStartReview,
  onViewStudyGuide,
  onViewBadges,
  onViewAuth,
  onViewLeaderboard,
  onViewShareCard,
  onEnableNotifications,
  onResetProgress,
  onSelectCosmetic,
  authSignedIn = false,
  authDisplayName = null,
  authLoading = false,
}: DashboardProps) {
  const rm = useReducedMotion();
  const chaptersData = chapters;
  const allWordsList = chaptersData.flatMap((chapter) => chapter.words);
  const totalWords = allWordsList.length;
  const solvedCount = progress.solvedWordIds.length;
  const reviewCount = getReviewWordIds(progress.wordStats).length;
  const masteredCount = Object.values(progress.wordStats ?? {}).filter((s) => s.mastered).length;
  const seenCount = Object.values(progress.wordStats ?? {}).filter((s) => s.seen || s.timesSolved > 0).length;
  const percentComplete = Math.round((solvedCount / totalWords) * 100);
  const todayKey = getTodayKey();
  const dailyDone = progress.dailyChallengeCompletedDate === todayKey;
  const dailyStreak = progress.dailyChallengeStreak ?? 0;
  const freezes = progress.streakFreezes ?? 0;
  const fragments = progress.fragmentIds?.length ?? 0;

  const nextMilestone = STREAK_MILESTONES.find((m) => m > dailyStreak);
  const reachedMilestone = [...STREAK_MILESTONES].reverse().find((m) => dailyStreak >= m);
  const streakAtRisk = dailyStreak > 0 && !dailyDone;

  const completedChaptersCount = chaptersData.reduce((acc, chapter) => {
    const isCompleted = chapter.words.every((w) => progress.solvedWordIds.includes(w.id));
    return isCompleted ? acc + 1 : acc;
  }, 0);

  const totalStars = Object.values(progress.chapterStars).reduce((sum, s) => sum + s, 0);
  const maxStars = chaptersData.length * 3;
  const bonusWord = allWordsList.find((w) => w.id === dailyBonusWordId);

  const xp = progress.xp ?? 0;
  const rankProgress = progressToNextRank(xp);
  const unlocked = new Set(progress.unlockedCosmetics ?? ["candle-classic"]);
  const candleCosmetics = COSMETICS.filter((c) => c.kind === "candle");

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 px-2">
      <motion.div
        initial={rm ? false : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl pcard text-[#2a2018] p-6 md:p-10 amber-glow text-center"
      >
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.28),transparent_70%)]" />
        <EllenWhiteAvatar reaction="idle" size={200} className="relative mx-auto mb-6" />
        <div className="relative inline-flex items-center gap-2 px-3 py-1 psunken rounded-full text-[#6b5537] text-xs tracking-[0.15em] uppercase font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#b45309]" aria-hidden="true" />
          Prophetic Word Study Game
        </div>
        <h1 className="relative text-3xl md:text-5xl font-display font-bold tracking-[0.08em] text-[#2a2018] mb-3">LAST DAY WORDS</h1>
        <p className="relative text-[#52412c] max-w-xl mx-auto text-base md:text-lg font-scripture italic mb-6 leading-relaxed">
          “Behold, I come quickly; hold that fast which thou hast, that no man take thy crown.” <br />
          <span className="text-[#6b5537] not-italic font-sans text-xs uppercase tracking-[0.2em] mt-1.5 block">— Revelation 3:11</span>
        </p>

        {/* Rank + XP */}
        <div className="relative mx-auto mb-4 max-w-md w-full pcard rounded-2xl p-4 text-left border border-[#e6c98a]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#b45309] fill-[#b45309]" aria-hidden="true" />
              <span className="text-sm font-bold text-[#2a2018]">{rankProgress.current.title}</span>
            </div>
            <span className="font-mono text-sm font-bold text-[#92400e]">{xp} XP</span>
          </div>
          <div className="w-full bg-[#e7d6b0] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#b45309] to-[#f59e0b] h-full rounded-full transition-all"
              style={{ width: `${Math.round(rankProgress.ratio * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-[#6b5537] mt-1.5 font-medium">
            {rankProgress.next
              ? `${rankProgress.xpInto} / ${rankProgress.xpNeeded} XP to ${rankProgress.next.title}`
              : "Max rank — Prophetic Scholar"}
          </p>
        </div>

        {/* Big streak flame */}
        <div className="relative mx-auto mb-6 inline-flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-[#2a2018] text-[#fbbf24] parchment-glow">
          <span className="text-4xl leading-none" aria-hidden="true">🔥</span>
          <span className="text-3xl font-extrabold font-mono">{dailyStreak}</span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#f4dca6]">Day Lamp Streak</span>
          {freezes > 0 && (
            <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#cbb487]">
              <Snowflake className="w-3 h-3" /> {freezes} freeze ready
            </span>
          )}
        </div>

        <p className="relative text-[#5c4a33] text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          {totalWords} prophetic terms across {chaptersData.length} chapters — with expert mode, daily challenge, and verified study unlocks.
        </p>
      </motion.div>

      {/* Word of the Week */}
      {wordOfTheWeek && (
        <motion.div
          initial={rm ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-left bg-gradient-to-r from-[#e8f0fe] to-[#fbf5e9] border border-[#b8c9e8] rounded-2xl p-5 parchment-glow"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-800 border border-blue-200">
              <BookOpen className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase font-bold tracking-[0.15em] text-blue-800 mb-1">
                Word of the Week
              </div>
              <h3 className="text-lg font-bold text-[#2a2018] font-display tracking-wide">
                {wordOfTheWeek.word}
              </h3>
              <p className="text-sm text-[#5c4a33] mt-1 line-clamp-2">{wordOfTheWeek.clue}</p>
              <p className="text-[11px] text-[#6b5537] mt-1 font-scripture italic">
                {wordOfTheWeek.verse}
              </p>
              {featuredAnnouncement && (
                <p className="text-xs text-blue-900 font-semibold mt-2">{featuredAnnouncement}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Season chips */}
      {seasons.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {seasons.map((s) => (
            <button
              key={s.id}
              onClick={onStartChapters}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border border-[#e6c98a] bg-[#fbf5e9] text-[#92400e] hover:border-[#b45309] cursor-pointer"
              title={s.description}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      <motion.button
        initial={rm ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rm ? 0 : 0.05 }}
        onClick={onStartDailyChallenge}
        className="w-full text-left bg-gradient-to-r from-[#fbeccb] to-[#fbf5e9] border border-[#e6c98a] rounded-2xl p-5 parchment-glow hover:border-[#b45309] transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#f4dca6] rounded-xl text-[#92400e] border border-[#e6c98a]">
              <Calendar className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-[#2a2018]">Daily Challenge</h3>
                {dailyDone && (
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">Done Today</span>
                )}
                {reachedMilestone && (
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-[#2a2018] text-[#fbbf24] rounded">{milestoneTitle(reachedMilestone)}</span>
                )}
              </div>
              {streakAtRisk ? (
                <p className="text-sm text-red-700 font-semibold">Day {dailyStreak} — don’t break your lamp streak!</p>
              ) : (
                <p className="text-sm text-[#6b5537]">5 mixed terms · ~2–4 min · same puzzle for everyone · +50 XP</p>
              )}
              {bonusWord && (
                <p className="text-[11px] text-[#92400e] font-semibold mt-1">
                  Today’s 2× bonus word is in the mix — look for a perfect solve.
                </p>
              )}
              {dailyStreak > 0 && nextMilestone && (
                <span className="text-[11px] text-[#6b5537] mt-1 block">
                  {nextMilestone - dailyStreak} days to “{milestoneTitle(nextMilestone)}”
                </span>
              )}
            </div>
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#92400e] group-hover:translate-x-0.5 transition-transform">
            {dailyDone ? "Replay" : "Play"} →
          </span>
        </div>
      </motion.button>

      {reviewCount > 0 && (
        <motion.button
          initial={rm ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onStartReview}
          className="w-full text-left bg-gradient-to-r from-[#efe0f5] to-[#fbf5e9] border border-[#d9bfe6] rounded-2xl p-5 parchment-glow hover:border-violet-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-violet-100 rounded-xl text-violet-700 border border-violet-200">
                <RotateCcw className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2a2018]">Spaced Review</h3>
                <p className="text-sm text-[#6b5537]">{reviewCount} word{reviewCount > 1 ? "s" : ""} to master</p>
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-violet-700">Review →</span>
          </div>
        </motion.button>
      )}

      <motion.div
        initial={rm ? false : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="pcard rounded-2xl p-5 parchment-glow flex items-center gap-4">
          <div className="p-3 bg-[#f0e3c8] rounded-xl text-[#92400e] border border-[#e6d3a8]"><BookOpen className="w-6 h-6" aria-hidden="true" /></div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl font-bold font-mono text-[#2a2018]">
              {solvedCount} <span className="text-xs text-[#6b5537] font-sans">/ {totalWords}</span>
            </div>
            <div className="text-[10px] text-[#6b5537] uppercase tracking-wider font-bold">Terms Deciphered</div>
            <div className="w-full bg-[#e7d6b0] h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-gradient-to-r from-[#b45309] to-[#f59e0b] h-full rounded-full" style={{ width: `${percentComplete}%` }} />
            </div>
            <div className="text-[10px] text-[#92400e] font-semibold mt-1.5">
              {masteredCount} mastered · {seenCount} seen once+
            </div>
          </div>
        </div>

        <div className="pcard rounded-2xl p-5 parchment-glow flex items-center gap-4">
          <div className="p-3 bg-[#f0e3c8] rounded-xl text-[#92400e] border border-[#e6d3a8]"><Award className="w-6 h-6" aria-hidden="true" /></div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#2a2018]">
              {totalStars} <span className="text-xs text-[#6b5537] font-sans">/ {maxStars}</span>
            </div>
            <div className="text-[10px] text-[#6b5537] uppercase tracking-wider font-bold">Prophecy Stars</div>
            <div className="text-[10px] text-[#5c4a33] mt-1 font-medium">
              {completedChaptersCount} of {chaptersData.length} chapters · freezes {freezes}
            </div>
          </div>
        </div>

        <div className="pcard rounded-2xl p-5 parchment-glow flex items-center gap-4">
          <div className="p-3 bg-[#f0e3c8] rounded-xl text-[#92400e] border border-[#e6d3a8]"><Puzzle className="w-6 h-6" aria-hidden="true" /></div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#2a2018]">
              {fragments} <span className="text-xs text-[#6b5537] font-sans">/ {FRAGMENTS_NEEDED}</span>
            </div>
            <div className="text-[10px] text-[#6b5537] uppercase tracking-wider font-bold">Mystery Fragments</div>
            <div className="text-[10px] text-[#5c4a33] mt-1 font-medium">
              {progress.fragmentsComplete ? "Bonus study unlocked" : "Perfect solves may drop pieces"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Candle cosmetics quick-select */}
      {onSelectCosmetic && (
        <div className="pcard rounded-2xl p-4">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#6b5537] mb-2">Lamp Style</div>
          <div className="flex flex-wrap gap-2">
            {candleCosmetics.map((c) => {
              const isUnlocked = unlocked.has(c.id);
              const isSelected = (progress.selectedCandle ?? "candle-classic") === c.id;
              return (
                <button
                  key={c.id}
                  disabled={!isUnlocked}
                  onClick={() => isUnlocked && onSelectCosmetic(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                    isSelected
                      ? "bg-[#2a2018] text-[#fbbf24] border-[#b45309]"
                      : isUnlocked
                        ? "bg-[#fbf5e9] text-[#2a2018] border-[#e2d2ac] hover:border-[#b45309] cursor-pointer"
                        : "bg-[#f0e3c8]/50 text-[#6b5537] border-[#e2d2ac] opacity-60 cursor-not-allowed"
                  }`}
                  title={isUnlocked ? c.description : `Unlock at ${c.unlockRank}`}
                >
                  {c.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onViewAuth}
        className="w-full pcard rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-[#b45309] text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#2a2018] text-[#fbbf24] flex items-center justify-center shrink-0">
            <LogIn className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#2a2018]">
              {authLoading
                ? "Checking account…"
                : authSignedIn
                  ? `Signed in as ${authDisplayName || "Player"}`
                  : "Sign in or create an account"}
            </p>
            <p className="text-xs text-[#6b5537] leading-snug">
              {authSignedIn
                ? "Sync progress, leaderboards, and online teams"
                : "Optional — play offline anytime; cloud unlocks sync & multiplayer"}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#b45309] shrink-0">
          {authSignedIn ? "Manage" : "Join"}
        </span>
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button onClick={onViewBadges} className="pcard rounded-xl p-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#b45309]">
          <Medal className="w-3.5 h-3.5" /> Badges
        </button>
        <button onClick={onViewShareCard} className="pcard rounded-xl p-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#b45309]">
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
        <button onClick={onViewLeaderboard} className="pcard rounded-xl p-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#b45309]">
          <Trophy className="w-3.5 h-3.5" /> Board
        </button>
        <button onClick={onViewAuth} className="pcard rounded-xl p-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#b45309]">
          <LogIn className="w-3.5 h-3.5" /> {authSignedIn ? "Account" : "Sign In"}
        </button>
      </div>

      {!progress.notificationsEnabled && (
        <button
          onClick={onEnableNotifications}
          className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#e6c98a] rounded-xl text-xs font-semibold text-[#92400e] cursor-pointer hover:bg-[#fbeccb]"
        >
          <Bell className="w-4 h-4" /> Enable streak-at-risk notifications
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={rm ? false : { opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
          className="pcard rounded-2xl p-6 flex flex-col justify-between parchment-glow hover:border-[#b45309] transition-all duration-300">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 psunken text-[#5c4a33] rounded text-xs font-bold tracking-wider uppercase">Chronological</span>
              <span className="flex items-center text-[#6b5537] text-xs font-medium gap-1">
                <Flame className="w-4 h-4 fill-[#e0a94a] text-[#b45309]" aria-hidden="true" /> {chaptersData.length} Chapters
              </span>
            </div>
            <h3 className="text-xl font-display font-bold text-[#2a2018] tracking-wide">Chapter Challenge</h3>
            <p className="text-[#5c4a33] text-sm leading-relaxed">
              Mastery bars unlock verified Scripture &amp; EGW study. Daniel &amp; Revelation seasonal tracks included.
            </p>
          </div>
          <button onClick={onStartChapters}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-[#2a2018] hover:bg-[#1c140d] text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-[0.15em] cursor-pointer">
            <Play className="w-3.5 h-3.5 fill-[#fbbf24] text-[#fbbf24]" aria-hidden="true" /> Begin Chapter Journey
          </button>
        </motion.div>

        <motion.div initial={rm ? false : { opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}
          className="pcard rounded-2xl p-6 flex flex-col justify-between parchment-glow hover:border-[#b45309] transition-all duration-300">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 psunken text-[#5c4a33] rounded text-xs font-bold tracking-wider uppercase">Arcade</span>
              <span className="text-[#6b5537] text-xs font-medium">30s · Golden events</span>
            </div>
            <h3 className="text-xl font-display font-bold text-[#2a2018] tracking-wide">Speed Round</h3>
            <p className="text-[#5c4a33] text-sm leading-relaxed">
              Combos, near-miss rematch, occasional Golden Word / Double Time. Best: {progress.speedRoundHighScore}
            </p>
          </div>
          <button onClick={onStartSpeedRound}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-[#f0e3c8] hover:bg-[#e8d7b3] text-[#3a2c1e] rounded-lg text-xs font-bold uppercase tracking-[0.15em] cursor-pointer border border-[#e2d2ac]">
            <Play className="w-3.5 h-3.5 fill-[#3a2c1e] text-[#3a2c1e]" aria-hidden="true" /> Enter Speed Arena
          </button>
        </motion.div>

        <motion.div initial={rm ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="pcard rounded-2xl p-6 flex flex-col justify-between parchment-glow hover:border-[#b45309] transition-all duration-300">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 psunken text-[#5c4a33] rounded text-xs font-bold tracking-wider uppercase">Multiplayer</span>
              <span className="flex items-center text-[#6b5537] text-xs font-medium gap-1"><Users className="w-4 h-4" aria-hidden="true" /> Local + Online</span>
            </div>
            <h3 className="text-xl font-display font-bold text-[#2a2018] tracking-wide">Teams Mode</h3>
            <p className="text-[#5c4a33] text-sm leading-relaxed">
              Pass-and-play on one device, or create a room code for your youth group.
            </p>
          </div>
          <div className="mt-6 space-y-2">
            <button onClick={onStartTeamsMode}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#3a2c1e] hover:bg-[#2a2018] text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-[0.15em] cursor-pointer">
              <Users className="w-3.5 h-3.5" aria-hidden="true" /> Local Team Battle
            </button>
            <button onClick={onStartOnlineTeams}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#fbf5e9] border border-[#e2d2ac] text-[#2a2018] rounded-lg text-xs font-bold uppercase tracking-[0.15em] cursor-pointer">
              Online Room Codes
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div initial={rm ? false : { opacity: 0 }} animate={{ opacity: 1 }}
        className="pt-4 border-t border-[#e2d2ac] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6b5537]">
        <button onClick={onViewStudyGuide}
          className="flex items-center gap-1.5 hover:text-[#2a2018] font-semibold py-1 px-3 hover:bg-[#f0e3c8] rounded transition-colors cursor-pointer">
          <HelpCircle className="w-4 h-4" aria-hidden="true" /> Study Guide — {totalWords} Terms + Expert Clues
        </button>
        <div className="flex items-center gap-4">
          <button onClick={onResetProgress} className="hover:text-red-700 font-medium py-1 px-2 hover:bg-red-50 rounded transition-colors cursor-pointer">
            Reset Game Data
          </button>
          <span aria-hidden="true">•</span>
          <span>Version 1.3.0</span>
        </div>
      </motion.div>
    </div>
  );
}
