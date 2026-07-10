/**
 * Game SFX. Files in public/sounds/, gated by the app sound toggle.
 *
 * - correct / wrong: letter guesses (via flashScreen)
 * - round-end: speed/teams round complete
 * - button: general UI button presses (not letter keys)
 * - tick: one timer-second pulse (sliced from clock track)
 */

type SfxKind = "correct" | "wrong" | "round-end" | "button" | "tick";

const SOURCES: Record<SfxKind, string> = {
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  "round-end": "/sounds/round-end.mp3",
  button: "/sounds/button.mp3",
  tick: "/sounds/tick.mp3",
};

const VOLUMES: Record<SfxKind, number> = {
  correct: 0.85,
  wrong: 0.75,
  "round-end": 0.8,
  button: 0.45,
  /** Soft so it can fire every second without drowning guesses. */
  tick: 0.4,
};

/** Clock source is a multi-second bed; only play the leading tick. */
const TICK_SLICE_MS = 280;

let soundsEnabled = true;
const cache: Partial<Record<SfxKind, HTMLAudioElement>> = {};
let tickStopTimer: ReturnType<typeof setTimeout> | null = null;

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
  if (!enabled) {
    stopTickSound();
  }
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

/** One second of the speed timer — play leading tick only. */
export function playTickSound(): void {
  if (!soundsEnabled) return;
  const audio = getAudio("tick");
  if (!audio) return;
  try {
    if (tickStopTimer) {
      clearTimeout(tickStopTimer);
      tickStopTimer = null;
    }
    audio.pause();
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        /* ignore */
      });
    }
    tickStopTimer = setTimeout(() => {
      tickStopTimer = null;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        /* ignore */
      }
    }, TICK_SLICE_MS);
  } catch {
    /* ignore */
  }
}

export function stopTickSound(): void {
  if (tickStopTimer) {
    clearTimeout(tickStopTimer);
    tickStopTimer = null;
  }
  const audio = cache.tick;
  if (!audio) return;
  try {
    audio.pause();
    audio.currentTime = 0;
  } catch {
    /* ignore */
  }
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
