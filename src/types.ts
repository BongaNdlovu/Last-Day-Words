import { WordTerm } from "./data/words";
import { StudyPassage } from "./data/studyContent";

export type GameMode =
  | "menu"
  | "speed-round"
  | "speed-chapter-select"
  | "teams-mode"
  | "online-teams"
  | "stats-help"
  | "badges"
  | "auth"
  | "leaderboard"
  | "share-card";

export interface WordStat {
  timesSolved: number;
  struggles: number;
  bestStars: number;
  mastered: boolean;
  /** True once the word has been seen/attempted at least once. */
  seen?: boolean;
}

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  threshold: number;
}

export interface UserProgress {
  solvedWordIds: string[];
  chapterStars: Record<string, number>;
  /** Legacy / overall best (max across modes). */
  speedRoundHighScore: number;
  speedRoundHighestWordsSolved: number;
  /** Per-board local highs (Mixed vs Chapter speed). */
  speedMixedHighScore?: number;
  speedMixedHighestWordsSolved?: number;
  speedChapterHighScore?: number;
  speedChapterHighestWordsSolved?: number;
  totalTimePlayedSec: number;
  soundEnabled: boolean;
  /** Background soundtrack on/off (independent of SFX). Default true when unset. */
  musicEnabled?: boolean;
  /** Background music volume 0–1. Default ~0.28 when unset. */
  musicVolume?: number;
  dailyChallengeCompletedDate?: string;
  dailyChallengeStreak?: number;
  /** ISO date of last day the streak was successfully maintained (play or freeze). */
  lastStreakDate?: string;
  /** Available streak freezes (max typically 1 unused). */
  streakFreezes?: number;
  /** ISO week key (YYYY-Www) when a freeze was last earned. */
  lastFreezeEarnedWeek?: string;
  /** Badge ids unlocked (streak milestones, weekly leaderboard, etc.). */
  earnedBadgeIds?: string[];
  /** Current weekly board placements (SAST week); drives revocable leaderboard badges. */
  leaderboardRanks?: {
    weekKey: string;
    mixed?: number | null;
    chapter?: number | null;
  };
  /** Chapter id → highest mastery tier unlocked (25|50|100). */
  masteryUnlocks?: Record<string, number>;
  /** Mystery fragment passage ids collected. */
  fragmentIds?: string[];
  /** True once 10 fragments collected and bonus study unlocked. */
  fragmentsComplete?: boolean;
  /** Date key when daily 2× bonus word was already awarded. */
  dailyBonusWordDate?: string;
  /** Word id that is today's 2× bonus word. */
  dailyBonusWordId?: string;
  wordStats?: Record<string, WordStat>;
  notificationsEnabled?: boolean;
  displayName?: string;
  /** Cumulative XP for rank progression. */
  xp?: number;
  /** Current rank id (novice | student | watchman | berean | prophetic-scholar). */
  rank?: string;
  /** Cosmetic ids unlocked by rank. */
  unlockedCosmetics?: string[];
  /** Active candle style cosmetic id. */
  selectedCandle?: string;
  /** Active chapter banner cosmetic id (empty = default). */
  selectedBanner?: string;
  /** Date key when study-guide open XP was already awarded. */
  studyGuideXpDate?: string;
  /** First-run onboarding tutorial dismissed. */
  onboardingComplete?: boolean;
  /** First Mixed Speed practice round finished (banked). */
  speedIntroMixedDone?: boolean;
  /** First Chapter Speed practice round finished (banked). */
  speedIntroChapterDone?: boolean;
}

export interface Season {
  id: string;
  title: string;
  description: string;
  startsOn?: string | null;
  endsOn?: string | null;
  chapterIds: string[];
}

export interface FeaturedContent {
  weekKey: string;
  wordId?: string | null;
  announcement?: string | null;
}

export interface GameState {
  currentWord: WordTerm;
  guessedLetters: string[];
  mistakes: number;
  maxMistakes: number;
  score: number;
  isSolved: boolean;
  isGameOver: boolean;
  isShowingBonus: boolean;
  chapterId?: string;
  wordIndexInChapter?: number;
}

export interface SpeedRoundState {
  score: number;
  timeLeft: number;
  wordsSolved: number;
  currentWord: WordTerm;
  guessedLetters: string[];
  mistakes: number;
  isGameOver: boolean;
  showComboBonus: boolean;
}

export interface RewardEvent {
  type: "scripture-bonus" | "fragment" | "daily-bonus" | "golden-word" | "double-time" | "mastery-unlock";
  title: string;
  passage?: StudyPassage;
  detail?: string;
}
