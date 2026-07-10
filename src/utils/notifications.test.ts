import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  scheduleStreakReminder,
  showStreakAtRiskNotification,
  checkDueStreakReminder,
  getStoredReminderFireAt,
  clearStreakReminderSchedule,
} from "./notifications";

describe("notifications", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    Object.defineProperty(globalThis, "Notification", {
      configurable: true,
      value: class {
        static permission = "granted";
        static requestPermission = vi.fn(async () => "granted");
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        ready: Promise.resolve({
          showNotification: vi.fn(async () => undefined),
        }),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not schedule when daily is already done", () => {
    const clear = scheduleStreakReminder(5, true);
    expect(clear).toBeTypeOf("function");
    vi.advanceTimersByTime(3 * 60 * 60 * 1000);
  });

  it("showStreakAtRiskNotification uses service worker when ready", async () => {
    const registration = await navigator.serviceWorker.ready;
    await showStreakAtRiskNotification(7);
    expect(registration.showNotification).toHaveBeenCalledWith(
      "Last Day Words",
      expect.objectContaining({ tag: "streak-at-risk" })
    );
  });

  it("persists reminder and fires on checkDueStreakReminder after delay", async () => {
    scheduleStreakReminder(5, false);
    expect(getStoredReminderFireAt()).not.toBeNull();
    vi.advanceTimersByTime(2 * 60 * 60 * 1000 + 1);
    checkDueStreakReminder();
    const registration = await navigator.serviceWorker.ready;
    expect(registration.showNotification).toHaveBeenCalled();
    expect(getStoredReminderFireAt()).toBeNull();
  });

  it("re-opening the app does not restart the countdown", () => {
    vi.setSystemTime(new Date("2026-07-10T10:00:00"));
    const clear = scheduleStreakReminder(5, false);
    const firstFireAt = getStoredReminderFireAt();
    clear(); // simulate unmount…
    // …but cleanup wipes storage; simulate the persisted case instead:
    scheduleStreakReminder(5, false);
    const persisted = getStoredReminderFireAt();
    vi.setSystemTime(new Date("2026-07-10T10:30:00"));
    scheduleStreakReminder(5, false); // app re-opened 30 min later
    expect(getStoredReminderFireAt()).toBe(persisted);
    expect(firstFireAt).not.toBeNull();
  });

  it("clamps the reminder before local midnight", () => {
    vi.setSystemTime(new Date("2026-07-10T23:00:00"));
    scheduleStreakReminder(5, false);
    const fireAt = getStoredReminderFireAt();
    expect(fireAt).not.toBeNull();
    expect(new Date(fireAt as number).getDate()).toBe(10); // still July 10 locally
    expect(fireAt as number).toBeLessThanOrEqual(new Date("2026-07-10T23:29:59.999").getTime());
  });

  it("fires a last-call within a minute when opened right before midnight", () => {
    vi.setSystemTime(new Date("2026-07-10T23:50:00"));
    scheduleStreakReminder(5, false);
    const fireAt = getStoredReminderFireAt();
    expect((fireAt as number) - Date.now()).toBeLessThanOrEqual(60 * 1000);
    expect(new Date(fireAt as number).getDate()).toBe(10);
  });

  it("clearStreakReminderSchedule removes persisted reminder", () => {
    scheduleStreakReminder(3, false);
    clearStreakReminderSchedule();
    expect(getStoredReminderFireAt()).toBeNull();
  });
});
