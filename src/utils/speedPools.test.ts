import { describe, expect, it } from "vitest";
import { chaptersData } from "../data/words";
import {
  CHAPTER_SPEED_IDS,
  assertDisjointPools,
  getChapterSpeedChapters,
  getChapterSpeedWords,
  getMixedSpeedChapters,
  getMixedSpeedWords,
  isChapterSpeedChapter,
} from "./speedPools";

describe("speedPools — dual boards with disjoint content", () => {
  it("lists 20 core chapter ids for Chapter Speed", () => {
    expect(CHAPTER_SPEED_IDS).toHaveLength(20);
    expect(new Set(CHAPTER_SPEED_IDS).size).toBe(20);
  });

  it("classifies chapter vs mixed chapters with no shared chapter ids", () => {
    const chapterChs = getChapterSpeedChapters(chaptersData);
    const mixedChs = getMixedSpeedChapters(chaptersData);
    const chapterIds = new Set(chapterChs.map((c) => c.id));
    const mixedIds = new Set(mixedChs.map((c) => c.id));
    for (const id of chapterIds) {
      expect(mixedIds.has(id)).toBe(false);
      expect(isChapterSpeedChapter(id)).toBe(true);
    }
    for (const id of mixedIds) {
      expect(isChapterSpeedChapter(id)).toBe(false);
    }
    expect(chapterChs.length).toBeGreaterThan(0);
    expect(mixedChs.length).toBeGreaterThan(0);
  });

  it("has zero overlapping word ids between chapter and mixed pools", () => {
    const { chapterWordIds, mixedWordIds, overlap } = assertDisjointPools(chaptersData);
    expect(overlap).toEqual([]);
    expect(chapterWordIds.length).toBeGreaterThan(0);
    expect(mixedWordIds.length).toBeGreaterThan(0);
    // Mixed should be the larger expansion-facing pool
    expect(mixedWordIds.length).toBeGreaterThan(chapterWordIds.length);
  });

  it("returns only that chapter’s words for Chapter Speed pick", () => {
    const first = getChapterSpeedChapters(chaptersData)[0];
    expect(first).toBeDefined();
    const words = getChapterSpeedWords(chaptersData, first.id);
    expect(words.length).toBe(first.words.length);
    expect(words.every((w) => first.words.some((fw) => fw.id === w.id))).toBe(true);
  });

  it("returns empty words for unknown or mixed-only chapter id", () => {
    const mixedOnly = getMixedSpeedChapters(chaptersData)[0];
    expect(mixedOnly).toBeDefined();
    expect(getChapterSpeedWords(chaptersData, mixedOnly.id)).toEqual([]);
    expect(getChapterSpeedWords(chaptersData, "not-a-real-chapter")).toEqual([]);
  });

  it("mixed pool equals flatMap of mixed chapters", () => {
    const words = getMixedSpeedWords(chaptersData);
    const fromChapters = getMixedSpeedChapters(chaptersData).flatMap((c) => c.words);
    expect(words.map((w) => w.id).sort()).toEqual(fromChapters.map((w) => w.id).sort());
  });
});
