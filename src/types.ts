import { WordTerm } from "./data/words";
import { StudyPassage } from "./data/studyContent";

export type GameMode =
  | "menu"
  | "chapter-select"
  | "gameplay"
  | "speed-round"
  | "teams-mode"
  | "online-teams"
  | "daily-challenge"
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
  speedRoundHighScore: number;
  speedRoundHighestWordsSolved: number;
  totalTimePlayedSec: number;
  soundEnabled: boolean;
  dailyChallengeCompletedDate?: string;
  dailyChallengeStreak?: number;
  /** ISO date of last day the streak was successfully maintained (play or freeze). */
  lastStreakDate?: string;
  /** Available streak freezes (max typically 1 unused). */
  streakFreezes?: number;
  /** ISO week key (YYYY-Www) when a freeze was last earned. */
  lastFreezeEarnedWeek?: string;
  /** Badge ids unlocked (streak milestones, etc.). */
  earnedBadgeIds?: string[];
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
