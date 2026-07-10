import { describe, expect, it } from "vitest";
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
  isValidSpeedScore,
  maxAllowedSpeedScore,
  MAX_SPEED_LETTER_POINTS_PER_WORD,
  MAX_SPEED_SCORE_PER_WORD,
  MAX_SPEED_SOLVE_POINTS_PER_WORD,
  MAX_UNIQUE_LETTERS_PER_WORD,
} from "./speedScoreLimits";

describe("speedScoreLimits — real scoring caps", () => {
  it("derives per-word max from letter + solve formulas (not the old 400 cap)", () => {
    const expectedLetters = computeSpeedLetterPoints(5, GOLDEN_WORD_SCORE_MULT, MAX_UNIQUE_LETTERS_PER_WORD);
    const expectedSolve = computeSpeedSolveBonus(0, MAX_MISTAKES, 5, GOLDEN_WORD_SCORE_MULT);
    expect(MAX_SPEED_LETTER_POINTS_PER_WORD).toBe(expectedLetters);
    expect(MAX_SPEED_SOLVE_POINTS_PER_WORD).toBe(expectedSolve);
    expect(MAX_SPEED_SCORE_PER_WORD).toBe(expectedLetters + expectedSolve);
    expect(MAX_SPEED_SCORE_PER_WORD).toBe(18400);
    expect(MAX_SPEED_SCORE_PER_WORD).toBeGreaterThan(400);
  });

  it("allows legitimate high scores that the old 400× cap rejected", () => {
    const oneWord = computeSpeedSolveBonus(0, 5, 1, 1); // 2000
    expect(oneWord).toBe(2000);
    expect(isValidSpeedScore(oneWord, 1)).toBe(true);
    expect(isValidSpeedScore(5000, 3)).toBe(true);
    expect(isValidSpeedScore(maxAllowedSpeedScore(5), 5)).toBe(true);
  });

  it("still rejects spoofed scores above the real ceiling", () => {
    expect(isValidSpeedScore(MAX_SPEED_SCORE_PER_WORD + 1, 1)).toBe(false);
    expect(isValidSpeedScore(999_999_999, 2)).toBe(false);
  });

  it("rejects negative or excessive word counts", () => {
    expect(isValidSpeedScore(100, -1)).toBe(false);
    expect(isValidSpeedScore(100, 81)).toBe(false);
  });

  it("exports constants for SQL sync checks", () => {
    const c = assertSpeedScoreLimitConstants();
    expect(c.maxCombo).toBe(2);
    expect(c.maxEvent).toBe(2);
    expect(c.maxPerWord).toBe(18400);
  });
});

describe("speed letter + solve total (single-word accuracy)", () => {
  it("letter points match SpeedRoundGame base formula", () => {
    expect(computeSpeedLetterPoints(1, 1)).toBe(100);
    expect(computeSpeedLetterPoints(2, 1)).toBe(125); // 1.25× combo
    expect(computeSpeedLetterPoints(5, 2)).toBe(400); // 2× combo × 2 golden
  });

  it("word total = letters + solve under same mults", () => {
    // 8 unique letters, 0 mistakes, maxMistakes 5, streak 1, no golden
    // letters: 8*100 = 800; solve: 2000; total 2800
    expect(computeSpeedWordTotalScore(8, 0, 5, 1, 1)).toBe(2800);
  });

  it("word total applies golden and combo to both parts", () => {
    // streak 5 → 2×, golden 2× → letter mult 4, solve (2000)*4 = 8000
    // 5 unique letters → 5*100*4 = 2000; total 10000
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
    // w1: 600 + 2000 = 2600
    // w2: 4*100*1.25 + (1000+800)*1.25 = 500 + 2250 = 2750
    // w3: 10*100*1.5*2 + 2000*1.5*2 = 3000 + 6000 = 9000
    expect(total).toBe(2600 + 2750 + 9000);
    expect(isValidSpeedScore(total, 3)).toBe(true);
  });
});
