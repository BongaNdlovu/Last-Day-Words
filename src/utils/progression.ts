import { COSMETICS, DEFAULT_CANDLE_ID, cosmeticsForRank } from "../data/cosmetics";
import { XP_REWARDS, rankForXp, type RankId } from "../data/ranks";
import type { UserProgress } from "../types";
import { getTodayKey } from "./dailyChallenge";

export type XpReason = "daily" | "perfect" | "speed" | "study";

export interface AwardXpResult {
  progress: UserProgress;
  awarded: number;
  reason: XpReason;
  rankChanged: boolean;
  newUnlocks: string[];
}

function ensureProgressionFields(p: UserProgress): UserProgress {
  const xp = Math.max(0, p.xp ?? 0);
  const rank = rankForXp(xp).id;
  const unlocked = p.unlockedCosmetics ?? cosmeticsForRank(rank).map((c) => c.id);
  return {
    ...p,
    xp,
    rank,
    unlockedCosmetics: unlocked,
    selectedCandle: p.selectedCandle ?? DEFAULT_CANDLE_ID,
    selectedBanner: p.selectedBanner ?? "",
  };
}

/** Unlock any cosmetics the current rank qualifies for. */
export function unlockCosmeticsForXp(progress: UserProgress): { progress: UserProgress; newUnlocks: string[] } {
  const base = ensureProgressionFields(progress);
  const rankId = rankForXp(base.xp ?? 0).id as RankId;
  const eligible = cosmeticsForRank(rankId).map((c) => c.id);
  const owned = new Set(base.unlockedCosmetics ?? []);
  const newUnlocks: string[] = [];
  for (const id of eligible) {
    if (!owned.has(id)) {
      owned.add(id);
      newUnlocks.push(id);
    }
  }
  return {
    progress: {
      ...base,
      rank: rankId,
      unlockedCosmetics: Array.from(owned),
    },
    newUnlocks,
  };
}

function applyXp(progress: UserProgress, amount: number, reason: XpReason): AwardXpResult {
  if (amount <= 0) {
    return {
      progress: ensureProgressionFields(progress),
      awarded: 0,
      reason,
      rankChanged: false,
      newUnlocks: [],
    };
  }
  const before = ensureProgressionFields(progress);
  const prevRank = before.rank;
  const nextXp = (before.xp ?? 0) + amount;
  const withXp: UserProgress = {
    ...before,
    xp: nextXp,
    rank: rankForXp(nextXp).id,
  };
  const { progress: unlocked, newUnlocks } = unlockCosmeticsForXp(withXp);
  return {
    progress: unlocked,
    awarded: amount,
    reason,
    rankChanged: unlocked.rank !== prevRank,
    newUnlocks,
  };
}

/** Daily challenge run complete: +50 XP. */
export function awardDailyCompleteXp(progress: UserProgress): AwardXpResult {
  return applyXp(progress, XP_REWARDS.dailyComplete, "daily");
}

/** Perfect word solve: +25 XP (0 mistakes on that word in speed, or legacy 3★). */
export function awardPerfectWordXp(progress: UserProgress): AwardXpResult {
  return applyXp(progress, XP_REWARDS.perfectWord, "perfect");
}

/** Award +25 XP for each perfect speed solve this round. */
export function awardPerfectWordsXp(progress: UserProgress, perfectCount: number): AwardXpResult {
  const n = Math.max(0, Math.floor(perfectCount));
  if (n === 0) {
    return {
      progress: ensureProgressionFields(progress),
      awarded: 0,
      reason: "perfect",
      rankChanged: false,
      newUnlocks: [],
    };
  }
  return applyXp(progress, XP_REWARDS.perfectWord * n, "perfect");
}

/** Speed round end: floor(score / 10) XP. */
export function awardSpeedXp(progress: UserProgress, finalScore: number): AwardXpResult {
  const amount = Math.floor(Math.max(0, finalScore) / XP_REWARDS.speedScoreDivisor);
  return applyXp(progress, amount, "speed");
}

/** Study guide open: +10 XP once per day. */
export function awardStudyGuideXp(progress: UserProgress, today = getTodayKey()): AwardXpResult {
  if (progress.studyGuideXpDate === today) {
    return {
      progress: ensureProgressionFields(progress),
      awarded: 0,
      reason: "study",
      rankChanged: false,
      newUnlocks: [],
    };
  }
  const result = applyXp(progress, XP_REWARDS.studyGuideOpen, "study");
  return {
    ...result,
    progress: {
      ...result.progress,
      studyGuideXpDate: today,
    },
  };
}

/** Merge local vs remote progression: take max XP and union of unlocks. */
export function mergeProgression(
  local: UserProgress,
  remote: {
    xp: number;
    rank?: string;
    unlocked_cosmetics?: string[] | null;
    selected_candle?: string | null;
    selected_banner?: string | null;
  }
): UserProgress {
  const localBase = ensureProgressionFields(local);
  const remoteXp = Math.max(0, remote.xp ?? 0);
  const maxXp = Math.max(localBase.xp ?? 0, remoteXp);
  const rank = rankForXp(maxXp).id;
  const localUnlocks = new Set(localBase.unlockedCosmetics ?? []);
  for (const id of remote.unlocked_cosmetics ?? []) {
    if (id) localUnlocks.add(id);
  }
  for (const c of cosmeticsForRank(rank)) {
    localUnlocks.add(c.id);
  }
  const selectedCandle =
    remote.selected_candle && localUnlocks.has(remote.selected_candle)
      ? remote.selected_candle
      : localBase.selectedCandle && localUnlocks.has(localBase.selectedCandle)
        ? localBase.selectedCandle
        : DEFAULT_CANDLE_ID;
  const selectedBanner =
    remote.selected_banner && localUnlocks.has(remote.selected_banner)
      ? remote.selected_banner
      : localBase.selectedBanner ?? "";

  return {
    ...localBase,
    xp: maxXp,
    rank,
    unlockedCosmetics: Array.from(localUnlocks),
    selectedCandle,
    selectedBanner,
  };
}

export function selectCosmetic(
  progress: UserProgress,
  cosmeticId: string
): UserProgress {
  const base = ensureProgressionFields(progress);
  const unlocked = base.unlockedCosmetics ?? [];
  if (!unlocked.includes(cosmeticId)) return base;
  const def = COSMETICS.find((c) => c.id === cosmeticId);
  if (!def) return base;
  if (def.kind === "candle") {
    return { ...base, selectedCandle: cosmeticId };
  }
  return { ...base, selectedBanner: cosmeticId };
}
