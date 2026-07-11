import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  areBackgroundMusicEnabled,
  areGameSoundsEnabled,
  DEFAULT_MUSIC_VOLUME,
  getBackgroundMusicVolume,
  playAnswerSfx,
  playButtonSfxForEventTarget,
  playRoundEndSound,
  playTickSound,
  setBackgroundMusicPrefs,
  setGameSoundsEnabled,
  resetAudioForTests,
  stopTickSound,
  unlockBackgroundMusic,
} from "./sounds";

function stubAudio() {
  const play = vi.fn(() => Promise.resolve());
  const pause = vi.fn();
  vi.stubGlobal(
    "Audio",
    vi.fn(function MockAudio(this: {
      play: typeof play;
      pause: typeof pause;
      currentTime: number;
      volume: number;
      preload: string;
      loop: boolean;
      paused: boolean;
    }) {
      this.play = play;
      this.pause = pause;
      this.currentTime = 0;
      this.volume = 1;
      this.preload = "auto";
      this.loop = false;
      this.paused = true;
    })
  );
  return { play, pause };
}

describe("sounds", () => {
  beforeEach(() => {
    resetAudioForTests();
    setGameSoundsEnabled(true);
    setBackgroundMusicPrefs(true, DEFAULT_MUSIC_VOLUME);
  });

  it("tracks enabled flag", () => {
    setGameSoundsEnabled(false);
    expect(areGameSoundsEnabled()).toBe(false);
    setGameSoundsEnabled(true);
    expect(areGameSoundsEnabled()).toBe(true);
  });

  it("play helpers do not throw when Audio is stubbed", () => {
    stubAudio();
    expect(() => playAnswerSfx(true)).not.toThrow();
    expect(() => playAnswerSfx(false)).not.toThrow();
    expect(() => playRoundEndSound()).not.toThrow();
    expect(() => playTickSound()).not.toThrow();
    expect(() => stopTickSound()).not.toThrow();
    setGameSoundsEnabled(false);
    expect(() => playAnswerSfx(true)).not.toThrow();
    expect(() => playTickSound()).not.toThrow();
    vi.unstubAllGlobals();
  });

  it("background music prefs are independent of SFX mute", () => {
    const { play, pause } = stubAudio();
    setBackgroundMusicPrefs(true, 0.3);
    expect(areBackgroundMusicEnabled()).toBe(true);
    expect(getBackgroundMusicVolume()).toBe(0.3);
    // First play requires unlock (user gesture / autoplay policy).
    expect(play).not.toHaveBeenCalled();
    unlockBackgroundMusic();
    expect(play).toHaveBeenCalled();

    setGameSoundsEnabled(false);
    expect(areBackgroundMusicEnabled()).toBe(true);

    setBackgroundMusicPrefs(false, 0.3);
    expect(areBackgroundMusicEnabled()).toBe(false);
    expect(pause).toHaveBeenCalled();

    // Unlock while muted must not restart playback.
    play.mockClear();
    unlockBackgroundMusic();
    expect(play).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("clamps music volume to 0–1", () => {
    stubAudio();
    setBackgroundMusicPrefs(true, 2);
    expect(getBackgroundMusicVolume()).toBe(1);
    setBackgroundMusicPrefs(true, -1);
    expect(getBackgroundMusicVolume()).toBe(0);
    vi.unstubAllGlobals();
  });

  it("playButtonSfxForEventTarget skips letter keyboard", () => {
    document.body.innerHTML = `
      <div data-no-button-sfx>
        <button id="key" type="button">A</button>
      </div>
      <button id="ui" type="button">Go</button>
    `;
    const { play } = stubAudio();
    playButtonSfxForEventTarget(document.getElementById("key"));
    expect(play).not.toHaveBeenCalled();
    playButtonSfxForEventTarget(document.getElementById("ui"));
    expect(play).toHaveBeenCalled();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });
});
