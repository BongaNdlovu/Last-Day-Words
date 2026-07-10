import type { RankId } from "./ranks";

export type CosmeticKind = "candle" | "banner";

export interface CosmeticDef {
  id: string;
  kind: CosmeticKind;
  title: string;
  description: string;
  /** Rank required to unlock (rank id). */
  unlockRank: RankId;
  /** CSS-friendly style token consumed by PropheticCandles. */
  styleToken: string;
}

/** Free rank-gated unlocks: candle styles + banners. */
export const COSMETICS: CosmeticDef[] = [
  {
    id: "candle-classic",
    kind: "candle",
    title: "Classic Lamps",
    description: "Warm amber prophetic lamps — the default glow.",
    unlockRank: "novice",
    styleToken: "classic",
  },
  {
    id: "candle-emerald",
    kind: "candle",
    title: "Emerald Vigil",
    description: "Green-tinted lamp flames for Student rank.",
    unlockRank: "student",
    styleToken: "emerald",
  },
  {
    id: "candle-sapphire",
    kind: "candle",
    title: "Sapphire Watch",
    description: "Cool blue flames for Watchman rank.",
    unlockRank: "watchman",
    styleToken: "sapphire",
  },
  {
    id: "banner-daniel",
    kind: "banner",
    title: "Daniel Scroll Banner",
    description: "Chapter cards edged with Daniel-track parchment.",
    unlockRank: "berean",
    styleToken: "daniel",
  },
  {
    id: "banner-revelation",
    kind: "banner",
    title: "Revelation Glory Banner",
    description: "Chapter cards edged with Revelation-track gold.",
    unlockRank: "prophetic-scholar",
    styleToken: "revelation",
  },
];

export const DEFAULT_CANDLE_ID = "candle-classic";
export const DEFAULT_BANNER_ID = "";

export function cosmeticsForRank(rankId: RankId): CosmeticDef[] {
  const order: RankId[] = ["novice", "student", "watchman", "berean", "prophetic-scholar"];
  const idx = order.indexOf(rankId);
  return COSMETICS.filter((c) => order.indexOf(c.unlockRank) <= idx);
}

export function cosmeticById(id: string): CosmeticDef | undefined {
  return COSMETICS.find((c) => c.id === id);
}
