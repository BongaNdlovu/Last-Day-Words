import { describe, expect, it } from "vitest";
import {
  calcStars,
  getMaxMistakes,
  getWordDifficulty,
  getChapterMastery,
  recordWordAttempt,
  getNextDepthHintTier,
  getDepthHintTierText,
  getDepthHint,
  isWordSolved,
  normalizeWord,
  computeSpeedLetterPoints,
  computeSpeedSolveBonus,
  computeSpeedWordTotalScore,
  isPerfectSpeedSolve,
  getSpeedComboMultiplier,
  normalizeForCompare,
  answerInScripture,
  isQuoteRecall,
} from "./gameLogic";
import { chaptersData } from "../data/words";
import type { WordTerm } from "../data/words";

describe("gameLogic", () => {
  it("calcStars returns 3 for perfect solve without hints", () => {
    expect(calcStars(0, 0)).toBe(3);
    expect(calcStars(1, 0)).toBe(2);
  });

  it("calcStars caps at 2 when hints were used", () => {
    expect(calcStars(0, 1)).toBe(2);
  });

  it("getWordDifficulty tiers by letter count", () => {
    const word = chaptersData[0].words[0];
    expect(["easy", "medium", "hard"]).toContain(getWordDifficulty(word));
    expect(getMaxMistakes("hard")).toBe(4);
    expect(getMaxMistakes("easy")).toBe(5);
  });

  it("getChapterMastery uses mastered count for percent and tier", () => {
    const chapter = chaptersData[0];
    const w0 = chapter.words[0].id;
    const w1 = chapter.words[1].id;
    const stats = recordWordAttempt({}, w0, 0, true, 0);
    const withMaster = recordWordAttempt(stats, w1, 0, true, 1);
    const mastery = getChapterMastery(chapter, withMaster);
    expect(withMaster[w0]?.mastered).toBe(true);
    expect(withMaster[w1]?.mastered).toBe(false);
    expect(mastery.masteredCount).toBe(1);
    expect(mastery.percent).toBe(Math.round((1 / chapter.words.length) * 100));
  });

  it("recordWordAttempt marks mastered only on clean 3-star solve", () => {
    const id = chaptersData[0].words[0].id;
    expect(recordWordAttempt({}, id, 0, true, 0)[id]?.mastered).toBe(true);
    expect(recordWordAttempt({}, id, 0, true, 1)[id]?.mastered).toBe(false);
  });

  it("getNextDepthHintTier skips expert tier when absent", () => {
    const word = { ...chaptersData[0].words[0], expertClue: undefined };
    expect(getNextDepthHintTier(word, 0)).toBe(1);
    expect(getNextDepthHintTier(word, 1)).toBeNull();
  });

  it("getDepthHintTierText returns mid-game tiers only (no verse)", () => {
    const word = chaptersData[0].words[0];
    expect(getDepthHintTierText(word, 1)).toContain(word.summary.slice(0, 20));
    if (word.expertClue) {
      expect(getDepthHintTierText(word, 2)).toContain("Expert clue");
    }
  });

  it("normalizeForCompare folds apostrophes and punctuation", () => {
    expect(normalizeForCompare("JACOB'S")).toBe(normalizeForCompare("JACOBS"));
    expect(normalizeForCompare("A MAN'S HAND")).toBe("A MANS HAND");
    expect(normalizeForCompare("  wars, and  rumours! ")).toBe("WARS AND RUMOURS");
  });

  const makeWord = (over: Partial<WordTerm>): WordTerm => ({
    id: "t",
    word: "",
    clue: "",
    verse: "",
    scripture: "",
    summary: "",
    ...over,
  });

  it("answerInScripture detects verbatim verse phrases (apostrophe-insensitive)", () => {
    expect(
      answerInScripture(
        makeWord({ word: "WARS AND RUMOURS OF WARS", scripture: "ye shall hear of wars and rumours of wars: see" })
      )
    ).toBe(true);
    expect(
      answerInScripture(makeWord({ word: "FINGERS OF A MAN'S HAND", scripture: "came forth fingers of a man's hand, and wrote" }))
    ).toBe(true);
    expect(
      answerInScripture(makeWord({ word: "INVESTIGATIVE JUDGMENT", scripture: "the judgment was set, and the books were opened" }))
    ).toBe(false);
  });

  it("isQuoteRecall respects the explicit override", () => {
    const notInText = makeWord({ word: "SEVEN TIMES MORE", scripture: "times more than it was wont" });
    expect(isQuoteRecall(notInText)).toBe(false);
    expect(isQuoteRecall({ ...notInText, quoteRecall: true })).toBe(true);
    const inText = makeWord({ word: "IMAGE OF GOLD", scripture: "made an image of gold, whose height" });
    expect(isQuoteRecall(inText)).toBe(true);
    expect(isQuoteRecall({ ...inText, quoteRecall: false })).toBe(false);
  });

  it("getDepthHint never exposes verse mid-game", () => {
    const word = chaptersData[0].words[0];
    for (let m = 0; m <= 5; m++) {
      const hint = getDepthHint(word, m, "medium");
      if (hint) expect(hint).not.toMatch(/Scripture:/i);
    }
  });

  it("isWordSolved ignores spaces and requires all letters", () => {
    const text = normalizeWord("GOD IS LOVE");
    expect(isWordSolved(text, ["G", "O", "D", "I", "S"])).toBe(false);
    expect(isWordSolved(text, ["G", "O", "D", "I", "S", "L", "V", "E"])).toBe(true);
  });
});

describe("speed round scoring", () => {
  it("perfect solve is zero mistakes at solve time", () => {
    expect(isPerfectSpeedSolve(0)).toBe(true);
    expect(isPerfectSpeedSolve(1)).toBe(false);
  });

  it("base solve bonus matches SpeedRoundGame formula", () => {
    expect(computeSpeedSolveBonus(0, 5, 1, 1)).toBe(2000);
    expect(computeSpeedSolveBonus(2, 5, 1, 1)).toBe(1600);
  });

  it("applies combo and golden multipliers", () => {
    expect(computeSpeedSolveBonus(0, 5, 5, 1)).toBe(4000);
    expect(computeSpeedSolveBonus(0, 5, 1, 2)).toBe(4000);
    expect(getSpeedComboMultiplier(5)).toBe(2);
  });

  it("letter points use same combo/golden mults as solve", () => {
    expect(computeSpeedLetterPoints(1, 1)).toBe(100);
    expect(computeSpeedLetterPoints(5, 1)).toBe(200);
    expect(computeSpeedLetterPoints(1, 2, 3)).toBe(600);
  });

  it("word total = unique letters + solve bonus", () => {
    expect(computeSpeedWordTotalScore(7, 0, 5, 1, 1)).toBe(700 + 2000);
  });

  it("accumulates multi-solve round totals accurately", () => {
    const solves = [
      { mistakes: 0, streak: 1, eventMult: 1 },
      { mistakes: 1, streak: 2, eventMult: 1 },
      { mistakes: 0, streak: 3, eventMult: 2 },
    ];
    const total = solves.reduce(
      (sum, s) => sum + computeSpeedSolveBonus(s.mistakes, 5, s.streak, s.eventMult),
      0
    );
    expect(total).toBe(2000 + 2250 + 6000);
  });
});
