import { WordTerm, Chapter, chaptersData, allWordsList } from "../data/words";
import { WordStat } from "../types";

export const ALPHABET = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");
export const MAX_MISTAKES = 5;
export const MAX_HINTS_PER_WORD = 2;
export const HINT_MISTAKE_PENALTY = 1;
export const TEAMS_QUESTIONS_PER_SIDE = 10;
export const SPEED_ROUND_TIME = 30;
export const SPEED_SOLVE_BONUS = 8;
export const SPEED_SKIP_PENALTY = 7;
export const EXPERT_MODE_LAMP_TIME = 20;

export type TeamId = "white" | "black";
export type Difficulty = "easy" | "medium" | "hard";

export function isLetter(char: string): boolean {
  return /^[A-Z]$/.test(char);
}

export function normalizeWord(word: string): string {
  return word.toUpperCase();
}

export function isWordSolved(wordText: string, guessedLetters: string[]): boolean {
  return wordText.split("").every((char) => !isLetter(char) || guessedLetters.includes(char));
}

export function getMaxMistakes(difficulty: Difficulty): number {
  return difficulty === "hard" ? 4 : 5;
}

export function calcStars(mistakes: number, hintsUsed: number): number {
  if (hintsUsed > 0) return Math.min(2, calcStars(mistakes, 0));
  if (mistakes === 0) return 3;
  if (mistakes <= 1) return 2;
  if (mistakes <= 3) return 1;
  return 0;
}

export function getChapterForWord(wordId: string): Chapter | undefined {
  return chaptersData.find((c) => c.words.some((w) => w.id === wordId));
}

// ---- Mastery / spaced repetition ----
export const REVIEW_STRUGGLE_THRESHOLD = 3;
export type MasteryTier = 0 | 25 | 50 | 100;

const emptyStat: WordStat = { timesSolved: 0, struggles: 0, bestStars: 0, mastered: false, seen: false };

/** Fold a completed word attempt into the word-stats map (returns a new map). */
export function recordWordAttempt(
  stats: Record<string, WordStat> | undefined,
  wordId: string,
  mistakes: number,
  solved: boolean,
  hintsUsed = 0
): Record<string, WordStat> {
  const map = { ...(stats || {}) };
  const prev = map[wordId] || emptyStat;
  const stars = solved ? calcStars(mistakes, hintsUsed) : 0;
  map[wordId] = {
    timesSolved: prev.timesSolved + (solved ? 1 : 0),
    struggles: prev.struggles + (!solved || mistakes > 0 || hintsUsed > 0 ? 1 : 0),
    bestStars: Math.max(prev.bestStars, stars),
    mastered: prev.mastered || (solved && stars === 3),
    seen: true,
  };
  return map;
}

/** Expert mode: expert clue only (no progressive depth hints). */
export function getExpertModeClue(word: WordTerm): string {
  return word.expertClue || word.clue;
}

export function isDueForReview(stat?: WordStat): boolean {
  return !!stat && !stat.mastered && stat.struggles >= REVIEW_STRUGGLE_THRESHOLD;
}

export function getReviewWordIds(stats: Record<string, WordStat> | undefined): string[] {
  if (!stats) return [];
  return Object.keys(stats).filter((id) => isDueForReview(stats[id]));
}

export function getChapterMastery(
  chapter: Chapter,
  stats?: Record<string, WordStat>
): { percent: number; tier: MasteryTier; masteredCount: number; total: number } {
  const total = chapter.words.length;
  if (total === 0) return { percent: 0, tier: 0, masteredCount: 0, total: 0 };
  const sumStars = chapter.words.reduce((acc, w) => acc + Math.min(3, stats?.[w.id]?.bestStars ?? 0), 0);
  const percent = Math.round((sumStars / (total * 3)) * 100);
  const masteredCount = chapter.words.filter((w) => stats?.[w.id]?.mastered).length;
  const tier: MasteryTier = percent >= 100 ? 100 : percent >= 50 ? 50 : percent >= 25 ? 25 : 0;
  return { percent, tier, masteredCount, total };
}

/** Build a review "chapter" of the words the player has struggled with. */
export function buildReviewChapter(stats?: Record<string, WordStat>): Chapter {
  const dueIds = getReviewWordIds(stats);
  const words = allWordsList.filter((w) => dueIds.includes(w.id));
  return {
    id: "review-session",
    title: "Spaced Review",
    description: "Words you've struggled with, brought back so you can master them.",
    words,
  };
}

export function getWordDifficulty(word: WordTerm): Difficulty {
  const letters = word.word.replace(/[^A-Za-z]/g, "").length;
  if (letters <= 8) return "easy";
  if (letters <= 14) return "medium";
  return "hard";
}

export function getDepthHint(word: WordTerm, mistakes: number, difficulty?: Difficulty): string | null {
  const max = difficulty ? getMaxMistakes(difficulty) : MAX_MISTAKES;
  const summaryAt = Math.max(2, Math.ceil(max * 0.6));
  const expertAt = max - 2;
  const scriptureAt = max - 1;
  if (mistakes >= scriptureAt) return `Scripture: ${word.verse}`;
  if (word.expertClue && mistakes >= expertAt) return `Expert clue: ${word.expertClue}`;
  if (mistakes >= summaryAt) return word.summary.slice(0, 100) + (word.summary.length > 100 ? "…" : "");
  return null;
}

export function pickRandomHintLetter(wordText: string, guessedLetters: string[]): string | null {
  const unguessed = wordText
    .split("")
    .filter((char) => isLetter(char) && !guessedLetters.includes(char));
  if (unguessed.length === 0) return null;
  return unguessed[Math.floor(Math.random() * unguessed.length)];
}

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickWeightedWord(words: WordTerm[]): WordTerm {
  if (words.length === 0) return allWordsList[0];
  const pool = words.flatMap((w) => {
    const d = getWordDifficulty(w);
    const weight = d === "hard" ? 3 : d === "medium" ? 2 : 1;
    return Array(weight).fill(w);
  });
  return pool[Math.floor(Math.random() * pool.length)];
}

export function buildTeamsRound(): WordTerm[] {
  const needed = TEAMS_QUESTIONS_PER_SIDE * 2;
  const weighted = shuffleArray(
    allWordsList.flatMap((w) => {
      const d = getWordDifficulty(w);
      const weight = d === "hard" ? 3 : d === "medium" ? 2 : 1;
      return Array(weight).fill(w);
    })
  );
  const picked: WordTerm[] = [];
  const used = new Set<string>();
  for (const w of weighted) {
    if (used.has(w.id)) continue;
    used.add(w.id);
    picked.push(w);
    if (picked.length >= needed) break;
  }
  for (const w of shuffleArray(allWordsList)) {
    if (picked.length >= needed) break;
    if (!used.has(w.id)) {
      picked.push(w);
      used.add(w.id);
    }
  }
  return shuffleArray(picked);
}

export function calcTeamPoints(mistakes: number, hintsUsed: number, solved: boolean, streak: number): number {
  if (!solved) return 0;
  const base = 100;
  const mistakePenalty = mistakes * 20;
  const hintPenalty = hintsUsed * 30;
  const streakBonus = streak >= 3 ? 25 : streak >= 2 ? 10 : 0;
  return Math.max(5, base - mistakePenalty - hintPenalty + streakBonus);
}

export function getStreakLabel(streak: number): string | null {
  if (streak >= 5) return `${streak}x ON FIRE!`;
  if (streak >= 3) return `${streak}x Streak!`;
  return null;
}

export function getSpeedComboMultiplier(streak: number): number {
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  if (streak >= 2) return 1.25;
  return 1;
}

export function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(pattern);
  }
}
