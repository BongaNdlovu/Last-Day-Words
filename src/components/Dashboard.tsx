import {
  Trophy,
  Flame,
  Play,
  Sparkles,
  Users,
  Bell,
  Share2,
  Medal,
  LogIn,
  Star,
  BookOpen,
  Zap,
} from "lucide-react";
import { UserProgress } from "../types";
import { Chapter, WordTerm } from "../data/words";
import { getTodayKey } from "../utils/dailyChallenge";
import { STREAK_MILESTONES, milestoneTitle } from "../utils/streaks";
import { progressToNextRank } from "../data/ranks";
import { COSMETICS } from "../data/cosmetics";
import { motion, useReducedMotion } from "motion/react";
import EllenWhiteAvatar from "./EllenWhiteAvatar";

interface DashboardProps {
  progress: UserProgress;
  chapters: Chapter[];
  wordOfTheWeek?: WordTerm | null;
  featuredAnnouncement?: string | null;
  onStartMixedSpeed: () => void;
  onStartChapterSpeed: () => void;
  onStartTeamsMode: () => void;
  onStartOnlineTeams: () => void;
  onViewStudyGuide: () => void;
  onViewBadges: () => void;
  onViewAuth: () => void;
  onViewLeaderboard: () => void;
  onViewShareCard: () => void;
  onEnableNotifications: () => void;
  onResetProgress: () => void;
  onSelectCosmetic?: (cosmeticId: string) => void;
  authSignedIn?: boolean;
  authDisplayName?: string | null;
  authLoading?: boolean;
}

export default function Dashboard({
  progress,
  chapters,
  wordOfTheWeek,
  featuredAnnouncement,
  onStartMixedSpeed,
  onStartChapterSpeed,
  onStartTeamsMode,
  onStartOnlineTeams,
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
  const allWordsList = chapters.flatMap((c) => c.words);
  const totalWords = allWordsList.length;
  const todayKey = getTodayKey();
  const dailyDone = progress.dailyChallengeCompletedDate === todayKey;
  const dailyStreak = progress.dailyChallengeStreak ?? 0;
  const freezes = progress.streakFreezes ?? 0;
  const streakAtRisk = dailyStreak > 0 && !dailyDone;
  const reachedMilestone = [...STREAK_MILESTONES].reverse().find((m) => dailyStreak >= m);

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
        <EllenWhiteAvatar reaction="idle" size={160} className="relative mx-auto mb-4" />
        <div className="relative inline-flex items-center gap-2 px-3 py-1 psunken rounded-full text-[#6b5537] text-xs tracking-[0.15em] uppercase font-semibold mb-3">
          <Zap className="w-3.5 h-3.5 text-[#b45309]" aria-hidden="true" />
          Prophetic Speed Arcade
        </div>
        <h1 className="relative text-3xl md:text-5xl font-display font-bold tracking-[0.08em] text-[#2a2018] mb-3">
          LAST DAY WORDS
        </h1>
        <p className="relative text-[#52412c] max-w-xl mx-auto text-base md:text-lg font-scripture italic mb-6 leading-relaxed">
          Race the clock. Guess prophetic terms from the clue. Climb the weekly board.
        </p>

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

        <div className="relative mx-auto mb-6 inline-flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-[#2a2018] text-[#fbbf24] parchment-glow">
          <span className="text-4xl leading-none" aria-hidden="true">
            🔥
          </span>
          <span className="text-3xl font-extrabold font-mono">{dailyStreak}</span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#f4dca6]">
            Day Lamp Streak
          </span>
          {freezes > 0 && (
            <span className="mt-1 text-[10px] text-[#cbb487]">{freezes} freeze ready</span>
          )}
          {streakAtRisk && (
            <span className="text-[10px] text-rose-300 font-bold mt-1">Play speed today to keep it!</span>
          )}
          {reachedMilestone && (
            <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-[#fbbf24]/15 text-[#fbbf24] rounded mt-1">
              {milestoneTitle(reachedMilestone)}
            </span>
          )}
        </div>

        <p className="relative text-[#5c4a33] text-sm max-w-xl mx-auto leading-relaxed mb-4">
          {totalWords} KJV-grounded terms · Mixed best{" "}
          <strong className="font-mono">
            {progress.speedMixedHighScore ?? progress.speedRoundHighScore}
          </strong>{" "}
          · Chapter best{" "}
          <strong className="font-mono">{progress.speedChapterHighScore ?? 0}</strong>
        </p>

        <div className="relative w-full max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onStartMixedSpeed}
            className="flex flex-col items-center justify-center gap-1.5 py-4 px-4 bg-[#2a2018] hover:bg-[#1c140d] text-[#f8f1e3] rounded-2xl text-sm font-bold uppercase tracking-[0.12em] cursor-pointer shadow-lg border border-[#b45309]/40"
          >
            <Play className="w-5 h-5 fill-[#fbbf24] text-[#fbbf24]" aria-hidden="true" />
            Mixed Speed
            <span className="text-[10px] font-medium normal-case tracking-normal text-[#cbb487]">
              Expansion pool · own board
            </span>
          </button>
          <button
            type="button"
            onClick={onStartChapterSpeed}
            className="flex flex-col items-center justify-center gap-1.5 py-4 px-4 bg-[#3d2e1f] hover:bg-[#2a2018] text-[#f8f1e3] rounded-2xl text-sm font-bold uppercase tracking-[0.12em] cursor-pointer shadow-lg border border-[#e6c98a]/50"
          >
            <BookOpen className="w-5 h-5 text-[#fbbf24]" aria-hidden="true" />
            Chapter Speed
            <span className="text-[10px] font-medium normal-case tracking-normal text-[#cbb487]">
              Pick a core chapter · +25 XP perfect
            </span>
          </button>
        </div>
        <p className="relative text-[11px] text-[#6b5537] mt-2">
          30s · combos · perfect word = +25 XP · disjoint pools
        </p>
      </motion.div>

      {wordOfTheWeek && (
        <motion.div
          initial={rm ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-left bg-gradient-to-r from-[#e8f0fe] to-[#fbf5e9] border border-[#b8c9e8] rounded-2xl p-5 parchment-glow"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-800 border border-blue-200">
              <Sparkles className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase font-bold tracking-[0.15em] text-blue-800 mb-1">
                Featured term (in the speed pool)
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onViewLeaderboard}
          className="pcard rounded-2xl p-5 text-left hover:border-[#b45309] cursor-pointer parchment-glow"
        >
          <Trophy className="w-6 h-6 text-[#b45309] mb-2" aria-hidden="true" />
          <h3 className="font-bold text-[#2a2018]">Weekly Boards</h3>
          <p className="text-xs text-[#6b5537] mt-1">Mixed + Chapter boards · sign in to post</p>
        </button>
        <button
          type="button"
          onClick={onViewStudyGuide}
          className="pcard rounded-2xl p-5 text-left hover:border-[#b45309] cursor-pointer"
        >
          <BookOpen className="w-6 h-6 text-[#92400e] mb-2" aria-hidden="true" />
          <h3 className="font-bold text-[#2a2018]">Word Bank</h3>
          <p className="text-xs text-[#6b5537] mt-1">Browse clues &amp; verses offline (no hangman)</p>
        </button>
      </div>

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
                ? "Sync progress and appear on the weekly board"
                : "Optional — play offline; cloud unlocks the leaderboard"}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#b45309] shrink-0">
          {authSignedIn ? "Manage" : "Join"}
        </span>
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={onViewBadges}
          className="pcard rounded-xl p-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#b45309]"
        >
          <Medal className="w-3.5 h-3.5" aria-hidden="true" /> Badges
        </button>
        <button
          type="button"
          onClick={onViewShareCard}
          className="pcard rounded-xl p-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#b45309]"
        >
          <Share2 className="w-3.5 h-3.5" aria-hidden="true" /> Share
        </button>
        <button
          type="button"
          onClick={onStartTeamsMode}
          className="pcard rounded-xl p-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#b45309]"
        >
          <Users className="w-3.5 h-3.5" aria-hidden="true" /> Teams
        </button>
        <button
          type="button"
          onClick={onStartOnlineTeams}
          className="pcard rounded-xl p-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#b45309]"
        >
          <Flame className="w-3.5 h-3.5" aria-hidden="true" /> Online
        </button>
      </div>

      {!progress.notificationsEnabled && (
        <button
          type="button"
          onClick={onEnableNotifications}
          className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#e6c98a] rounded-xl text-xs font-semibold text-[#92400e] cursor-pointer hover:bg-[#fbeccb]"
        >
          <Bell className="w-4 h-4" aria-hidden="true" /> Enable streak-at-risk notifications
        </button>
      )}

      {onSelectCosmetic && (
        <div className="pcard rounded-2xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b5537] mb-3">Candle style</h3>
          <div className="flex flex-wrap gap-2">
            {candleCosmetics.map((c) => {
              const locked = !unlocked.has(c.id);
              const selected = progress.selectedCandle === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={locked}
                  onClick={() => onSelectCosmetic(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer disabled:opacity-40 ${
                    selected
                      ? "bg-[#2a2018] text-[#f8f1e3] border-[#2a2018]"
                      : "bg-[#fbf5e9] border-[#e2d2ac] text-[#5c4a33]"
                  }`}
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
        onClick={onResetProgress}
        className="w-full text-[10px] text-[#a8926a] hover:text-red-800 uppercase tracking-wider font-semibold py-2 cursor-pointer"
      >
        Reset all local progress
      </button>
    </div>
  );
}
