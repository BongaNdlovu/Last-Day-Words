/**
 * Game SFX. Files in public/sounds/, gated by the app sound toggle.
 *
 * - correct / wrong: letter guesses (via flashScreen)
 * - round-end: speed/teams round complete
 * - button: general UI button presses (not letter keys)
 */

type SfxKind = "correct" | "wrong" | "round-end" | "button";

const SOURCES: Record<SfxKind, string> = {
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  "round-end": "/sounds/round-end.mp3",
  button: "/sounds/button.mp3",
};

const VOLUMES: Record<SfxKind, number> = {
  correct: 0.85,
  wrong: 0.75,
  "round-end": 0.8,
  button: 0.45,
};

let soundsEnabled = true;
const cache: Partial<Record<SfxKind, HTMLAudioElement>> = {};

function getAudio(kind: SfxKind): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  if (!cache[kind]) {
    const audio = new Audio(SOURCES[kind]);
    audio.preload = "auto";
    audio.volume = VOLUMES[kind];
    cache[kind] = audio;
  }
  return cache[kind] ?? null;
}

/** Keep in sync with UserProgress.soundEnabled from App. */
export function setGameSoundsEnabled(enabled: boolean): void {
  soundsEnabled = enabled;
}

export function areGameSoundsEnabled(): boolean {
  return soundsEnabled;
}

function play(kind: SfxKind): void {
  if (!soundsEnabled) return;
  const audio = getAudio(kind);
  if (!audio) return;
  try {
    audio.pause();
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        /* autoplay policy or missing file — ignore */
      });
    }
  } catch {
    /* ignore playback errors */
  }
}

export function playCorrectSound(): void {
  play("correct");
}

export function playWrongSound(): void {
  play("wrong");
}

export function playRoundEndSound(): void {
  play("round-end");
}

export function playButtonSound(): void {
  play("button");
}

/** Convenience for letter-guess feedback. */
export function playAnswerSfx(correct: boolean): void {
  if (correct) playCorrectSound();
  else playWrongSound();
}

/**
 * Play UI click SFX for a click target, unless it is a letter key or opt-out.
 */
export function playButtonSfxForEventTarget(target: EventTarget | null): void {
  if (!soundsEnabled || !(target instanceof Element)) return;
  const interactive = target.closest(
    'button, [role="button"], input[type="submit"], input[type="button"], a[href]'
  );
  if (!interactive) return;
  if (interactive.closest("[data-no-button-sfx]")) return;
  if ((interactive as HTMLButtonElement).disabled) return;
  if (interactive.getAttribute("aria-disabled") === "true") return;
  playButtonSound();
}
