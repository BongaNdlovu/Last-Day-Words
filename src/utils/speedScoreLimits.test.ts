import { describe, expect, it, beforeEach } from "vitest";
import {
  computeSpeedLetterPoints,
  computeSpeedSolveBonus,
  computeSpeedWordTotalScore,
  getSpeedComboMultiplier,
  MAX_MISTAKES,
} from "./gameLogic";
import { GOLDEN_WORD_SCORE_MULT } from "./rewards";
import {
  assertSpeedScoreLimitConstants,
  canSubmitSpeedScore,
  isValidSpeedScore,
  markSpeedSubmitAttempt,
  maxAllowedSpeedScore,
  minAllowedSpeedScore,
  MIN_SPEED_SCORE_PER_WORD,
  MAX_SPEED_LETTER_POINTS_PER_WORD,
  MAX_SPEED_SCORE_PER_WORD,
  MAX_SPEED_SOLVE_POINTS_PER_WORD,
  MAX_UNIQUE_LETTERS_PER_WORD,
  peekSpeedSubmitAllowed,
  resetSpeedSubmitThrottleForTests,
  validateSpeedScorePayload,
} from "./speedScoreLimits";

describe("speedScoreLimits — real scoring caps", () => {
  beforeEach(() => {
    resetSpeedSubmitThrottleForTests();
  });

  it("derives per-word max from letter + solve formulas (not the old 400 cap)", () => {
    const expectedLetters = computeSpeedLetterPoints(5, GOLDEN_WORD_SCORE_MULT, MAX_UNIQUE_LETTERS_PER_WORD);
    const expectedSolve = computeSpeedSolveBonus(0, MAX_MISTAKES, 5, GOLDEN_WORD_SCORE_MULT);
    expect(MAX_SPEED_LETTER_POINTS_PER_WORD).toBe(expectedLetters);
    expect(MAX_SPEED_SOLVE_POINTS_PER_WORD).toBe(expectedSolve);
    expect(MAX_SPEED_SCORE_PER_WORD).toBe(expectedLetters + expectedSolve);
    expect(MAX_SPEED_SCORE_PER_WORD).toBe(18400);
    expect(MIN_SPEED_SCORE_PER_WORD).toBe(1000);
  });

  it("allows legitimate high scores that the old 400× cap rejected", () => {
    const oneWord = computeSpeedSolveBonus(0, 5, 1, 1); // 2000
    expect(oneWord).toBe(2000);
    expect(isValidSpeedScore(oneWord, 1)).toBe(true);
    expect(isValidSpeedScore(5000, 3)).toBe(true);
    expect(isValidSpeedScore(maxAllowedSpeedScore(5), 5)).toBe(true);
  });

  it("rejects spoofed scores above the real ceiling", () => {
    expect(isValidSpeedScore(MAX_SPEED_SCORE_PER_WORD + 1, 1)).toBe(false);
    expect(validateSpeedScorePayload(MAX_SPEED_SCORE_PER_WORD + 1, 1)).toEqual({
      ok: false,
      reason: "score_above_max_for_words",
    });
  });

  it("rejects negative or excessive word counts", () => {
    expect(isValidSpeedScore(100, -1)).toBe(false);
    expect(isValidSpeedScore(100, 81)).toBe(false);
  });

  it("rejects non-integers and non-finite values", () => {
    expect(validateSpeedScorePayload(2000.5, 1).ok).toBe(false);
    expect(validateSpeedScorePayload(2000, 1.2).ok).toBe(false);
    expect(validateSpeedScorePayload(Number.NaN, 1).ok).toBe(false);
    expect(validateSpeedScorePayload(2000, Number.POSITIVE_INFINITY).ok).toBe(false);
  });

  it("rejects nonzero score with zero words", () => {
    expect(validateSpeedScorePayload(500, 0)).toEqual({
      ok: false,
      reason: "zero_words_nonzero_score",
    });
    expect(validateSpeedScorePayload(0, 0).ok).toBe(true);
  });

  it("rejects score below min per solved word (1000)", () => {
    expect(minAllowedSpeedScore(2)).toBe(2000);
    expect(validateSpeedScorePayload(1999, 2)).toEqual({
      ok: false,
      reason: "score_below_min_for_words",
    });
    expect(validateSpeedScorePayload(2000, 2).ok).toBe(true);
  });

  it("rejects invalid board mode", () => {
    expect(validateSpeedScorePayload(2000, 1, "mixed").ok).toBe(true);
    expect(validateSpeedScorePayload(2000, 1, "chapter").ok).toBe(true);
    expect(validateSpeedScorePayload(2000, 1, "hack")).toEqual({
      ok: false,
      reason: "invalid_mode",
    });
  });

  it("throttles cloud submits within the min interval", () => {
    const t0 = 1_000_000;
    expect(canSubmitSpeedScore(2000, 1, "mixed", t0).ok).toBe(true);
    markSpeedSubmitAttempt(t0);
    expect(peekSpeedSubmitAllowed(t0 + 1000)).toBe(false);
    expect(canSubmitSpeedScore(3000, 1, "mixed", t0 + 1000)).toEqual({
      ok: false,
      reason: "submit_too_soon",
    });
    expect(canSubmitSpeedScore(3000, 1, "mixed", t0 + 8_000).ok).toBe(true);
  });

  it("exports constants for SQL sync checks", () => {
    const c = assertSpeedScoreLimitConstants();
    expect(c.maxCombo).toBe(2);
    expect(c.maxEvent).toBe(2);
    expect(c.maxPerWord).toBe(18400);
    expect(c.minPerWord).toBe(1000);
    expect(c.maxWords).toBe(80);
    expect(c.minSubmitIntervalMs).toBe(8000);
  });
});

describe("speed letter + solve total (single-word accuracy)", () => {
  it("letter points match SpeedRoundGame base formula", () => {
    expect(computeSpeedLetterPoints(1, 1)).toBe(100);
    expect(computeSpeedLetterPoints(2, 1)).toBe(125); // 1.25× combo
    expect(computeSpeedLetterPoints(5, 2)).toBe(400); // 2× combo × 2 golden
  });

  it("word total = letters + solve under same mults", () => {
    expect(computeSpeedWordTotalScore(8, 0, 5, 1, 1)).toBe(2800);
  });

  it("word total applies golden and combo to both parts", () => {
    expect(getSpeedComboMultiplier(5)).toBe(2);
    expect(computeSpeedWordTotalScore(5, 0, 5, 5, 2)).toBe(10_000);
  });

  it("multi-word round total is sum of per-word totals", () => {
    const words = [
      { letters: 6, mistakes: 0, maxM: 5, streak: 1, evt: 1 },
      { letters: 4, mistakes: 1, maxM: 5, streak: 2, evt: 1 },
      { letters: 10, mistakes: 0, maxM: 5, streak: 3, evt: 2 },
    ];
    const total = words.reduce(
      (sum, w) =>
        sum + computeSpeedWordTotalScore(w.letters, w.mistakes, w.maxM, w.streak, w.evt),
      0
    );
    expect(total).toBe(2600 + 2750 + 9000);
    expect(isValidSpeedScore(total, 3)).toBe(true);
  });
});
