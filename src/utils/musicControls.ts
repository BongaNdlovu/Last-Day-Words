import type { UserProgress } from "../types";

type MusicKeyUnlockEvent = Pick<
  KeyboardEvent,
  "altKey" | "ctrlKey" | "isComposing" | "key" | "metaKey" | "repeat"
> & {
  target: EventTarget | null;
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "input, textarea, select, [contenteditable=''], [contenteditable='true'], [role='textbox'], [role='searchbox']"
    )
  );
}

export function shouldUnlockBackgroundMusicForKey(event: MusicKeyUnlockEvent): boolean {
  if (event.repeat || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) {
    return false;
  }
  if (isEditableTarget(event.target)) return false;
  if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") return true;
  return event.key.length === 1;
}

export function getMusicVolumeUpdate(
  value: number
): Required<Pick<UserProgress, "musicEnabled" | "musicVolume">> {
  const musicVolume = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
  return {
    musicVolume,
    musicEnabled: musicVolume > 0,
  };
}
