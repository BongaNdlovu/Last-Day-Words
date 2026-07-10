/** ~12% chance of a Speed Round special event when a new word loads. */
export type SpeedEvent = "none" | "golden-word" | "double-time";

export function rollSpeedEvent(): SpeedEvent {
  const r = Math.random();
  if (r < 0.06) return "golden-word";
  if (r < 0.12) return "double-time";
  return "none";
}

export const EXPERT_MODE_TIME = 20;
export const SPEED_ROUND_TIME_DEFAULT = 30;
export const DOUBLE_TIME_BONUS = 15;
export const GOLDEN_WORD_SCORE_MULT = 2;
