import { describe, expect, it } from "vitest";
import { chaptersData, allWordsList } from "./words";
import { answerInScripture, isQuoteRecall, normalizeForCompare } from "../utils/gameLogic";

describe("word data integrity", () => {
  it("scripture text is free of page-number artifacts", () => {
    // The KJV cleanup removed stray page markers like "2654 Hebrews 12".
    // Canonical KJV spells numbers as words, so a 3-4 digit run before a letter is junk.
    const offenders = allWordsList.filter((w) => /\b\d{3,4}\s+[A-Za-z]/.test(w.scripture));
    expect(offenders.map((w) => w.id)).toEqual([]);
  });

  it("every scripture is non-empty and starts with a capital (no mid-verse fragment)", () => {
    const badStart = allWordsList.filter((w) => !w.scripture.trim() || /^[a-z;,]/.test(w.scripture.trim()));
    expect(badStart.map((w) => w.id)).toEqual([]);
  });

  it("auto-detected quote-recall words truly contain their answer verbatim", () => {
    // When quoteRecall is not explicitly overridden, the badge/verse anchor only
    // appears because the answer is a real phrase in the verse.
    const auto = allWordsList.filter((w) => w.quoteRecall === undefined);
    const broken = auto.filter((w) => isQuoteRecall(w) !== answerInScripture(w));
    expect(broken.map((w) => w.id)).toEqual([]);
  });

  it("concept answers are explicitly marked quoteRecall:false", () => {
    // A word whose answer is not in its verse must be an intentional concept term,
    // not an accidental miss — so it should carry the explicit override.
    const accidental = allWordsList.filter((w) => !answerInScripture(w) && w.quoteRecall !== false);
    expect(accidental.map((w) => w.id)).toEqual([]);
  });

  it("word ids are unique", () => {
    const ids = allWordsList.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("normalizeForCompare matches answers across straight/curly apostrophes", () => {
    // KJV source uses curly apostrophes; answers use straight ones.
    expect(normalizeForCompare("refiner’s fire")).toBe(normalizeForCompare("REFINER'S FIRE"));
  });

  it("majority of words are complete-the-verse quote items", () => {
    const quote = allWordsList.filter((w) => isQuoteRecall(w)).length;
    expect(quote).toBeGreaterThan(allWordsList.length * 0.8);
  });

  it("chapters each hold five words", () => {
    for (const ch of chaptersData) expect(ch.words.length).toBe(5);
  });
});
