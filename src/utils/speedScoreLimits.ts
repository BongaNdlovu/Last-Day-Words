import {
  MAX_MISTAKES,
  computeSpeedLetterPoints,
  computeSpeedSolveBonus,
  getSpeedComboMultiplier,
} from "./gameLogic";
import { GOLDEN_WORD_SCORE_MULT } from "./rewards";
import type { SpeedBoardMode } from "./speedPools";

/**
 * Anti-cheat for speed_scores (client + docs for DB trigger sync).
 * Derived from SpeedRoundGame formulas.
 *
 * Per word worst-case max:
 * - 26 unique letters × max combo (2×) × golden (2×)
 * - perfect solve at maxMistakes=5 under same mults
 *
 * Per word minimum (solved word always pays solve bonus):
 * - max mistakes used → base solve 1000 × 1× combo × no golden
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

/**
 * Min points for one solved word: solve bonus with all mistakes used, no combo/golden.
 * Matches computeSpeedSolveBonus(maxMistakes, maxMistakes, 1, 1) = 1000.
 */
export const MIN_SPEED_SCORE_PER_WORD = computeSpeedSolveBonus(
  MAX_MISTAKES,
  MAX_MISTAKES,
  1,
  1
);

/** Upper bound on words_solved claims per round (30s base + time bonuses). */
export const MAX_SPEED_WORDS_PER_ROUND = 80;

/** Min gap between weekly score *increases* (client throttle; DB also enforces). */
export const MIN_SCORE_SUBMIT_INTERVAL_MS = 8_000;

export type SpeedScoreRejectReason =
  | "non_finite"
  | "non_integer"
  | "negative"
  | "too_many_words"
  | "zero_words_nonzero_score"
  | "score_below_min_for_words"
  | "score_above_max_for_words"
  | "invalid_mode"
  | "submit_too_soon";

export type SpeedScoreValidation =
  | { ok: true }
  | { ok: false; reason: SpeedScoreRejectReason };

export function maxAllowedSpeedScore(wordsSolved: number): number {
  return Math.max(0, Math.floor(wordsSolved)) * MAX_SPEED_SCORE_PER_WORD;
}

export function minAllowedSpeedScore(wordsSolved: number): number {
  const n = Math.max(0, Math.floor(wordsSolved));
  if (n === 0) return 0;
  return n * MIN_SPEED_SCORE_PER_WORD;
}

/** Pure structural checks (no rate limit). */
export function validateSpeedScorePayload(
  score: number,
  wordsSolved: number,
  mode?: SpeedBoardMode | string
): SpeedScoreValidation {
  if (!Number.isFinite(score) || !Number.isFinite(wordsSolved)) {
    return { ok: false, reason: "non_finite" };
  }
  if (!Number.isInteger(score) || !Number.isInteger(wordsSolved)) {
    return { ok: false, reason: "non_integer" };
  }
  if (score < 0 || wordsSolved < 0) {
    return { ok: false, reason: "negative" };
  }
  if (wordsSolved > MAX_SPEED_WORDS_PER_ROUND) {
    return { ok: false, reason: "too_many_words" };
  }
  if (wordsSolved === 0 && score !== 0) {
    return { ok: false, reason: "zero_words_nonzero_score" };
  }
  if (wordsSolved > 0 && score < minAllowedSpeedScore(wordsSolved)) {
    return { ok: false, reason: "score_below_min_for_words" };
  }
  if (score > maxAllowedSpeedScore(wordsSolved)) {
    return { ok: false, reason: "score_above_max_for_words" };
  }
  if (mode !== undefined && mode !== "mixed" && mode !== "chapter") {
    return { ok: false, reason: "invalid_mode" };
  }
  return { ok: true };
}

/** @deprecated prefer validateSpeedScorePayload; kept for call-site clarity. */
export function isValidSpeedScore(score: number, wordsSolved: number): boolean {
  return validateSpeedScorePayload(score, wordsSolved).ok;
}

/** Client-side throttle so a scripted loop cannot hammer the board API. */
let lastSubmitAtMs = 0;

export function resetSpeedSubmitThrottleForTests(): void {
  lastSubmitAtMs = 0;
}

/**
 * Returns true if enough time has passed since the last *attempted* cloud submit.
 * Call only when about to upsert (failed validation should not burn the window).
 */
export function consumeSpeedSubmitSlot(
  nowMs = Date.now(),
  minIntervalMs = MIN_SCORE_SUBMIT_INTERVAL_MS
): boolean {
  if (nowMs - lastSubmitAtMs < minIntervalMs) {
    return false;
  }
  lastSubmitAtMs = nowMs;
  return true;
}

export function peekSpeedSubmitAllowed(
  nowMs = Date.now(),
  minIntervalMs = MIN_SCORE_SUBMIT_INTERVAL_MS
): boolean {
  return nowMs - lastSubmitAtMs >= minIntervalMs;
}

/** Full gate used before cloud upsert. */
export function canSubmitSpeedScore(
  score: number,
  wordsSolved: number,
  mode: SpeedBoardMode,
  nowMs = Date.now()
): SpeedScoreValidation {
  const payload = validateSpeedScorePayload(score, wordsSolved, mode);
  if (!payload.ok) return payload;
  if (!peekSpeedSubmitAllowed(nowMs)) {
    return { ok: false, reason: "submit_too_soon" };
  }
  return { ok: true };
}

/** Mark a successful/attempted submit for throttle (call after canSubmit ok). */
export function markSpeedSubmitAttempt(nowMs = Date.now()): void {
  lastSubmitAtMs = nowMs;
}

/** For SQL / docs: must match migration caps. */
export function assertSpeedScoreLimitConstants(): {
  maxCombo: number;
  maxEvent: number;
  maxPerWord: number;
  minPerWord: number;
  maxWords: number;
  minSubmitIntervalMs: number;
} {
  return {
    maxCombo,
    maxEvent,
    maxPerWord: MAX_SPEED_SCORE_PER_WORD,
    minPerWord: MIN_SPEED_SCORE_PER_WORD,
    maxWords: MAX_SPEED_WORDS_PER_ROUND,
    minSubmitIntervalMs: MIN_SCORE_SUBMIT_INTERVAL_MS,
  };
}
