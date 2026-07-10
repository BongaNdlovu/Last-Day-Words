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
} from "./gameLogic";
import { chaptersData } from "../data/words";

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
