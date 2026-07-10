/** Rank ladder and XP thresholds for Last Day Words progression. */

export type RankId =
  | "novice"
  | "student"
  | "watchman"
  | "berean"
  | "prophetic-scholar";

export interface RankDef {
  id: RankId;
  title: string;
  /** Minimum XP required to hold this rank. */
  minXp: number;
}

/** Thresholds: 0 / 200 / 600 / 1500 / 3500 */
export const RANKS: RankDef[] = [
  { id: "novice", title: "Novice", minXp: 0 },
  { id: "student", title: "Student", minXp: 200 },
  { id: "watchman", title: "Watchman", minXp: 600 },
  { id: "berean", title: "Berean", minXp: 1500 },
  { id: "prophetic-scholar", title: "Prophetic Scholar", minXp: 3500 },
];

export const XP_REWARDS = {
  /** Perfect speed solve (0 mistakes on a word). */
  perfectWord: 25,
  /** Speed score is divided by this (score/10). */
  speedScoreDivisor: 10,
  studyGuideOpen: 10,
} as const;

export function rankForXp(xp: number): RankDef {
  const safe = Math.max(0, Math.floor(xp));
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (safe >= rank.minXp) current = rank;
  }
  return current;
}

export function nextRank(xp: number): RankDef | null {
  const current = rankForXp(xp);
  const idx = RANKS.findIndex((r) => r.id === current.id);
  if (idx < 0 || idx >= RANKS.length - 1) return null;
  return RANKS[idx + 1];
}

/** Progress 0–1 toward the next rank (1 if max rank). */
export function progressToNextRank(xp: number): { current: RankDef; next: RankDef | null; ratio: number; xpInto: number; xpNeeded: number } {
  const current = rankForXp(xp);
  const next = nextRank(xp);
  if (!next) {
    return { current, next: null, ratio: 1, xpInto: 0, xpNeeded: 0 };
  }
  const span = next.minXp - current.minXp;
  const xpInto = Math.max(0, xp - current.minXp);
  const ratio = span > 0 ? Math.min(1, xpInto / span) : 1;
  return { current, next, ratio, xpInto, xpNeeded: span };
}
