import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  areGameSoundsEnabled,
  playAnswerSfx,
  playButtonSfxForEventTarget,
  playRoundEndSound,
  setGameSoundsEnabled,
} from "./sounds";

describe("sounds", () => {
  beforeEach(() => {
    setGameSoundsEnabled(true);
  });

  it("tracks enabled flag", () => {
    setGameSoundsEnabled(false);
    expect(areGameSoundsEnabled()).toBe(false);
    setGameSoundsEnabled(true);
    expect(areGameSoundsEnabled()).toBe(true);
  });

  it("play helpers do not throw when Audio is stubbed", () => {
    const play = vi.fn(() => Promise.resolve());
    vi.stubGlobal(
      "Audio",
      vi.fn(function MockAudio(this: {
        play: typeof play;
        pause: () => void;
        currentTime: number;
        volume: number;
        preload: string;
      }) {
        this.play = play;
        this.pause = vi.fn();
        this.currentTime = 0;
        this.volume = 1;
        this.preload = "auto";
      })
    );
    expect(() => playAnswerSfx(true)).not.toThrow();
    expect(() => playAnswerSfx(false)).not.toThrow();
    expect(() => playRoundEndSound()).not.toThrow();
    setGameSoundsEnabled(false);
    expect(() => playAnswerSfx(true)).not.toThrow();
    vi.unstubAllGlobals();
  });

  it("playButtonSfxForEventTarget skips letter keyboard", () => {
    document.body.innerHTML = `
      <div data-no-button-sfx>
        <button id="key" type="button">A</button>
      </div>
      <button id="ui" type="button">Go</button>
    `;
    const play = vi.fn(() => Promise.resolve());
    vi.stubGlobal(
      "Audio",
      vi.fn(function MockAudio(this: { play: typeof play; pause: () => void; currentTime: number; volume: number }) {
        this.play = play;
        this.pause = vi.fn();
        this.currentTime = 0;
        this.volume = 1;
      })
    );
    playButtonSfxForEventTarget(document.getElementById("key"));
    expect(play).not.toHaveBeenCalled();
    playButtonSfxForEventTarget(document.getElementById("ui"));
    expect(play).toHaveBeenCalled();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });
});
