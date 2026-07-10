import {
  MAX_MISTAKES,
  computeSpeedLetterPoints,
  computeSpeedSolveBonus,
  getSpeedComboMultiplier,
} from "./gameLogic";
import { GOLDEN_WORD_SCORE_MULT } from "./rewards";

/**
 * Anti-cheat ceilings for speed_scores upserts.
 * Derived from the same formulas SpeedRoundGame uses (not the old 400 letter-only cap).
 *
 * Per word worst-case:
 * - all 26 letters correct under max combo (2×) and golden (2×)
 * - perfect solve at maxMistakes=5 under same mults
 */

/** Streak at which combo multiplier reaches its max (2×). */
const MAX_COMBO_STREAK = 5;

const maxCombo = getSpeedComboMultiplier(MAX_COMBO_STREAK);
const maxEvent = GOLDEN_WORD_SCORE_MULT;

/** Distinct A–Z letters possible in a term. */
export const MAX_UNIQUE_LETTERS_PER_WORD = 26;

export const MAX_SPEED_LETTER_POINTS_PER_WORD = computeSpeedLetterPoints(
  MAX_COMBO_STREAK,
  maxEvent,
  MAX_UNIQUE_LETTERS_PER_WORD
);

export const MAX_SPEED_SOLVE_POINTS_PER_WORD = computeSpeedSolveBonus(
  0,
  MAX_MISTAKES,
  MAX_COMBO_STREAK,
  maxEvent
);

/** Max points claimable per solved word (letters + solve). */
export const MAX_SPEED_SCORE_PER_WORD =
  MAX_SPEED_LETTER_POINTS_PER_WORD + MAX_SPEED_SOLVE_POINTS_PER_WORD;

/** Upper bound on words_solved claims per round (30s base + time bonuses). */
export const MAX_SPEED_WORDS_PER_ROUND = 80;

export function maxAllowedSpeedScore(wordsSolved: number): number {
  return Math.max(0, Math.floor(wordsSolved)) * MAX_SPEED_SCORE_PER_WORD;
}

export function isValidSpeedScore(score: number, wordsSolved: number): boolean {
  return (
    Number.isFinite(score) &&
    Number.isFinite(wordsSolved) &&
    score >= 0 &&
    wordsSolved >= 0 &&
    wordsSolved <= MAX_SPEED_WORDS_PER_ROUND &&
    score <= maxAllowedSpeedScore(wordsSolved)
  );
}

/** For SQL / docs: must match MAX_SPEED_SCORE_PER_WORD. */
export function assertSpeedScoreLimitConstants(): {
  maxCombo: number;
  maxEvent: number;
  maxPerWord: number;
} {
  return {
    maxCombo,
    maxEvent,
    maxPerWord: MAX_SPEED_SCORE_PER_WORD,
  };
}
