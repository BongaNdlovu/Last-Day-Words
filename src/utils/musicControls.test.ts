import { afterEach, describe, expect, it } from "vitest";
import { getMusicVolumeUpdate, shouldUnlockBackgroundMusicForKey } from "./musicControls";

type KeyEvent = Parameters<typeof shouldUnlockBackgroundMusicForKey>[0];

function keyEvent(overrides: Partial<KeyEvent> = {}): KeyEvent {
  return {
    altKey: false,
    ctrlKey: false,
    isComposing: false,
    key: "A",
    metaKey: false,
    repeat: false,
    target: document.body,
    ...overrides,
  };
}

describe("musicControls", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("guards background music unlocks for non-activation keydown events", () => {
    expect(shouldUnlockBackgroundMusicForKey(keyEvent({ repeat: true }))).toBe(false);
    expect(shouldUnlockBackgroundMusicForKey(keyEvent({ altKey: true }))).toBe(false);
    expect(shouldUnlockBackgroundMusicForKey(keyEvent({ ctrlKey: true }))).toBe(false);
    expect(shouldUnlockBackgroundMusicForKey(keyEvent({ metaKey: true }))).toBe(false);
    expect(shouldUnlockBackgroundMusicForKey(keyEvent({ isComposing: true }))).toBe(false);
    expect(shouldUnlockBackgroundMusicForKey(keyEvent({ key: "ArrowDown" }))).toBe(false);
  });

  it("does not unlock background music from editable fields", () => {
    document.body.innerHTML = `
      <input id="name" />
      <div contenteditable="true"><span id="editable-child">Text</span></div>
    `;

    expect(
      shouldUnlockBackgroundMusicForKey(keyEvent({ target: document.getElementById("name") }))
    ).toBe(false);
    expect(
      shouldUnlockBackgroundMusicForKey(
        keyEvent({ target: document.getElementById("editable-child") })
      )
    ).toBe(false);
  });

  it("allows gameplay and activation keydown events to unlock background music", () => {
    expect(shouldUnlockBackgroundMusicForKey(keyEvent({ key: "A" }))).toBe(true);
    expect(shouldUnlockBackgroundMusicForKey(keyEvent({ key: "Enter" }))).toBe(true);
    expect(shouldUnlockBackgroundMusicForKey(keyEvent({ key: " " }))).toBe(true);
  });

  it("treats zero music volume as muted state", () => {
    expect(getMusicVolumeUpdate(0)).toEqual({ musicEnabled: false, musicVolume: 0 });
    expect(getMusicVolumeUpdate(0.45)).toEqual({ musicEnabled: true, musicVolume: 0.45 });
    expect(getMusicVolumeUpdate(2)).toEqual({ musicEnabled: true, musicVolume: 1 });
    expect(getMusicVolumeUpdate(-1)).toEqual({ musicEnabled: false, musicVolume: 0 });
  });
});
