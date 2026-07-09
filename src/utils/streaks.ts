import { getTodayKey } from "./dailyChallenge";
import { BadgeDef, UserProgress } from "../types";

export const STREAK_MILESTONES = [7, 30, 100] as const;

export const STREAK_BADGES: BadgeDef[] = [
  {
    id: "week-warrior",
    title: "Week Warrior",
    description: "Keep your lamp burning for 7 days in a row.",
    threshold: 7,
  },
  {
    id: "faithful-watchman",
    title: "Faithful Watchman",
    description: "30 consecutive days of prophetic study.",
    threshold: 30,
  },
  {
    id: "centurion-of-prophecy",
    title: "Centurion of Prophecy",
    description: "100 days — a century of faithfulness.",
    threshold: 100,
  },
];

export function milestoneTitle(m: number): string {
  if (m >= 100) return "Centurion of Prophecy";
  if (m >= 30) return "Faithful Watchman";
  return "Week Warrior";
}

export function badgeIdForStreak(streak: number): string | null {
  const badge = [...STREAK_BADGES].reverse().find((b) => streak >= b.threshold);
  return badge?.id ?? null;
}

/** ISO week key like 2026-W28 for freeze earning once per week. */
export function getIsoWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function yesterdayKey(todayKey: string): string {
  const d = new Date(todayKey + "T12:00:00");
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * On app load: if the player missed yesterday and has a freeze, consume it
 * and preserve the streak. If they missed without a freeze, reset streak.
 */
export function reconcileStreakOnLoad(progress: UserProgress, today = getTodayKey()): UserProgress {
  const streak = progress.dailyChallengeStreak ?? 0;
  if (streak <= 0) return progress;

  const last = progress.lastStreakDate ?? progress.dailyChallengeCompletedDate;
  if (!last) return progress;
  if (last === today || last === yesterdayKey(today)) return progress;

  // Missed at least one full day
  const freezes = progress.streakFreezes ?? 0;
  if (freezes > 0) {
    const earned = new Set(progress.earnedBadgeIds ?? []);
    return {
      ...progress,
      streakFreezes: freezes - 1,
      lastStreakDate: yesterdayKey(today), // freeze covers the gap through yesterday
      earnedBadgeIds: Array.from(earned),
    };
  }

  return {
    ...progress,
    dailyChallengeStreak: 0,
    lastStreakDate: last,
  };
}

/** After finishing today's daily for the first time today. */
export function applyDailyStreakComplete(progress: UserProgress, today = getTodayKey()): UserProgress {
  if (progress.dailyChallengeCompletedDate === today) return progress;

  const yesterday = yesterdayKey(today);
  let streak = 1;
  if (
    progress.dailyChallengeCompletedDate === yesterday ||
    progress.lastStreakDate === yesterday ||
    progress.lastStreakDate === today
  ) {
    streak = (progress.dailyChallengeStreak ?? 0) + 1;
  }

  const earned = new Set(progress.earnedBadgeIds ?? []);
  for (const badge of STREAK_BADGES) {
    if (streak >= badge.threshold) earned.add(badge.id);
  }

  return {
    ...progress,
    dailyChallengeCompletedDate: today,
    dailyChallengeStreak: streak,
    lastStreakDate: today,
    earnedBadgeIds: Array.from(earned),
  };
}

/** Completing a chapter earns 1 freeze once per ISO week (if none unused). */
export function maybeEarnStreakFreeze(progress: UserProgress, now = new Date()): UserProgress {
  const week = getIsoWeekKey(now);
  if (progress.lastFreezeEarnedWeek === week) return progress;
  const current = progress.streakFreezes ?? 0;
  if (current >= 1) {
    return { ...progress, lastFreezeEarnedWeek: week };
  }
  return {
    ...progress,
    streakFreezes: current + 1,
    lastFreezeEarnedWeek: week,
  };
}
