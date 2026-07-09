import { Chapter, WordTerm } from "../data/words";

export const DAILY_WORD_COUNT = 5;

export function getTodayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function dateToSeed(dateKey: string): number {
  return dateKey.split("-").reduce((acc, n) => acc * 31 + parseInt(n, 10), 0);
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getDailyWords(allWords: WordTerm[], dateKey = getTodayKey()): WordTerm[] {
  const seed = dateToSeed(dateKey);
  return seededShuffle(allWords, seed).slice(0, DAILY_WORD_COUNT);
}

export function buildDailyChapter(allWords: WordTerm[], dateKey = getTodayKey()): Chapter {
  const formatted = new Date(dateKey + "T12:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return {
    id: "daily-challenge",
    title: "Daily Prophetic Challenge",
    description: `${DAILY_WORD_COUNT} terms for ${formatted}. Everyone gets the same words today.`,
    words: getDailyWords(allWords, dateKey),
  };
}
