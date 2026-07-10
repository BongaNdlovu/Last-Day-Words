import { describe, expect, it } from "vitest";
import { XP_REWARDS } from "../data/ranks";
import type { UserProgress } from "../types";
import { awardPerfectWordXp, awardPerfectWordsXp, awardSpeedXp } from "./progression";

const baseProgress = (): UserProgress => ({
  solvedWordIds: [],
  chapterStars: {},
  speedRoundHighScore: 0,
  speedRoundHighestWordsSolved: 0,
  totalTimePlayedSec: 0,
  soundEnabled: true,
  wordStats: {},
  xp: 0,
  rank: "novice",
  unlockedCosmetics: ["candle-classic"],
  selectedCandle: "candle-classic",
  selectedBanner: "",
});

describe("perfect word XP (+25) for speed", () => {
  it("awardPerfectWordXp grants exactly XP_REWARDS.perfectWord (25)", () => {
    expect(XP_REWARDS.perfectWord).toBe(25);
    const result = awardPerfectWordXp(baseProgress());
    expect(result.awarded).toBe(25);
    expect(result.reason).toBe("perfect");
    expect(result.progress.xp).toBe(25);
  });

  it("awardPerfectWordsXp multiplies by perfect count", () => {
    const result = awardPerfectWordsXp(baseProgress(), 3);
    expect(result.awarded).toBe(75);
    expect(result.progress.xp).toBe(75);
  });

  it("awardPerfectWordsXp awards 0 for zero or negative counts", () => {
    expect(awardPerfectWordsXp(baseProgress(), 0).awarded).toBe(0);
    expect(awardPerfectWordsXp(baseProgress(), -2).awarded).toBe(0);
    expect(awardPerfectWordsXp(baseProgress(), 0).progress.xp).toBe(0);
  });

  it("floors fractional perfect counts", () => {
    const result = awardPerfectWordsXp(baseProgress(), 2.9);
    expect(result.awarded).toBe(50);
  });

  it("stacks with speed score XP (perfect then speed)", () => {
    let p = baseProgress();
    p = awardPerfectWordsXp(p, 2).progress; // +50
    p = awardSpeedXp(p, 340).progress; // floor(340/10)=34
    expect(p.xp).toBe(84);
  });
});
