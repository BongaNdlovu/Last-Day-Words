import type { Chapter, WordTerm } from "../data/words";

/**
 * Disjoint speed pools so Mixed and Chapter never share content.
 *
 * - Chapter track: original 20 core prophecy chapters (post top-up: 5 words each).
 * - Mixed track: all other catalog chapters (expansions, extra books, etc.).
 */

export type SpeedBoardMode = "mixed" | "chapter";

/** Core tracks that used to power chapter hangman — now Chapter Speed. */
export const CHAPTER_SPEED_IDS: readonly string[] = [
  "signs",
  "shaking",
  "latter-rain",
  "loud-cry",
  "seal-of-god",
  "time-of-trouble",
  "second-coming",
  "new-earth",
  "judgment",
  "deceptions",
  "daniel-image",
  "daniel-beasts",
  "daniel-horn",
  "daniel-sanctuary",
  "daniel-stand",
  "rev-churches",
  "rev-seals",
  "rev-trumpets",
  "rev-beast",
  "rev-millennium",
] as const;

const chapterIdSet = new Set(CHAPTER_SPEED_IDS);

export function isChapterSpeedChapter(chapterId: string): boolean {
  return chapterIdSet.has(chapterId);
}

/** Chapters eligible for Chapter Speed (pick one). */
export function getChapterSpeedChapters(all: Chapter[]): Chapter[] {
  return all.filter((c) => isChapterSpeedChapter(c.id) && c.words.length > 0);
}

/** Chapters whose words form the Mixed Speed pool only. */
export function getMixedSpeedChapters(all: Chapter[]): Chapter[] {
  return all.filter((c) => !isChapterSpeedChapter(c.id) && c.words.length > 0);
}

export function getMixedSpeedWords(all: Chapter[]): WordTerm[] {
  return getMixedSpeedChapters(all).flatMap((c) => c.words);
}

export function getChapterSpeedWords(all: Chapter[], chapterId: string): WordTerm[] {
  const ch = all.find((c) => c.id === chapterId && isChapterSpeedChapter(c.id));
  return ch?.words.slice() ?? [];
}

export function assertDisjointPools(all: Chapter[]): {
  chapterWordIds: string[];
  mixedWordIds: string[];
  overlap: string[];
} {
  const chapterWordIds = getChapterSpeedChapters(all).flatMap((c) => c.words.map((w) => w.id));
  const mixedWordIds = getMixedSpeedWords(all).map((w) => w.id);
  const mixedSet = new Set(mixedWordIds);
  const overlap = chapterWordIds.filter((id) => mixedSet.has(id));
  return { chapterWordIds, mixedWordIds, overlap };
}
