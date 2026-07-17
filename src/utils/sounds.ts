/**
 * Game audio. Files in public/sounds/.
 *
 * SFX (gated by soundEnabled):
 * - correct / wrong: letter guesses (via flashScreen)
 * - solve: applause when a word is fully solved (the final correct answer)
 * - round-end: speed/teams round complete
 * - button: general UI button presses (not letter keys)
 * - tick: one timer-second pulse (sliced from clock track)
 *
 * Background music (gated by musicEnabled + musicVolume, independent of SFX).
 */

type SfxKind = "correct" | "wrong" | "solve" | "round-end" | "button" | "tick";

const SOURCES: Record<SfxKind, string> = {
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  solve: "/sounds/applause.mp3",
  "round-end": "/sounds/round-end.mp3",
  button: "/sounds/button.mp3",
  tick: "/sounds/tick.mp3",
};

const VOLUMES: Record<SfxKind, number> = {
  correct: 0.85,
  wrong: 0.75,
  /** Applause reward on a full solve — celebratory but not overwhelming. */
  solve: 0.9,
  "round-end": 0.8,
  button: 0.45,
  /** Soft so it can fire every second without drowning guesses. */
  tick: 0.4,
};

const BG_MUSIC_SRC = "/sounds/bg-music.mp3";
/** Quiet default so SFX stay readable. */
export const DEFAULT_MUSIC_VOLUME = 0.28;

/** Clock source is a multi-second bed; only play the leading tick. */
const TICK_SLICE_MS = 280;

let soundsEnabled = true;
let musicEnabled = true;
let musicVolume = DEFAULT_MUSIC_VOLUME;
const cache: Partial<Record<SfxKind, HTMLAudioElement>> = {};
let bgMusic: HTMLAudioElement | null = null;
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

function clampVolume(v: number): number {
  if (!Number.isFinite(v)) return DEFAULT_MUSIC_VOLUME;
  return Math.min(1, Math.max(0, v));
}

function getBgMusic(): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  if (!bgMusic) {
    const audio = new Audio(BG_MUSIC_SRC);
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = clampVolume(musicVolume);
    bgMusic = audio;
  }
  return bgMusic;
}

function tryPlayBgMusic(): void {
  if (!musicEnabled || clampVolume(musicVolume) <= 0) return;
  const audio = getBgMusic();
  if (!audio) return;
  try {
    audio.volume = clampVolume(musicVolume);
    if (!audio.paused) return;
    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        /* autoplay policy — unlock on next user gesture via unlockBackgroundMusic */
      });
    }
  } catch {
    /* ignore */
  }
}

function pauseBgMusic(): void {
  if (!bgMusic) return;
  try {
    bgMusic.pause();
  } catch {
    /* ignore */
  }
}

/** Keep in sync with UserProgress.musicEnabled / musicVolume from App. */
export function setBackgroundMusicPrefs(enabled: boolean, volume: number): void {
  musicEnabled = enabled;
  musicVolume = clampVolume(volume);
  if (bgMusic) {
    bgMusic.volume = musicVolume;
  }
  if (!musicEnabled || musicVolume <= 0) {
    pauseBgMusic();
  } else if (bgMusic) {
    // Already created (e.g. after unlock) — resume with new prefs.
    tryPlayBgMusic();
  }
  // First start is deferred to unlockBackgroundMusic (user gesture / autoplay policy).
}

export function areBackgroundMusicEnabled(): boolean {
  return musicEnabled;
}

export function getBackgroundMusicVolume(): number {
  return musicVolume;
}

/**
 * Call after a user gesture so browsers allow music after autoplay block.
 * Safe to call often; no-ops when muted or already playing.
 */
export function unlockBackgroundMusic(): void {
  tryPlayBgMusic();
}

/** Clear cached audio elements (tests only). */
export function resetAudioForTests(): void {
  pauseBgMusic();
  bgMusic = null;
  if (tickStopTimer) {
    clearTimeout(tickStopTimer);
    tickStopTimer = null;
  }
  for (const key of Object.keys(cache) as SfxKind[]) {
    delete cache[key];
  }
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

/** Applause for the final correct answer — a fully solved word. */
export function playSolveSound(): void {
  play("solve");
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
