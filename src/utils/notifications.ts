/** Browser Notification helpers for streak-at-risk reminders (PWA-friendly). */

const STREAK_REMINDER_TAG = "streak-at-risk";
const STREAK_REMINDER_DELAY_MS = 2 * 60 * 60 * 1000;
/** Fire no later than this long before local midnight — after midnight the streak is already lost. */
const LAST_CALL_BUFFER_MS = 30 * 60 * 1000;
const REMINDER_STORAGE_KEY = "ldw-streak-reminder";

type StoredReminder = { fireAt: number; dayCount: number };

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function canNotify(): boolean {
  return typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted";
}

function readStoredReminder(): StoredReminder | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredReminder;
    if (typeof parsed.fireAt !== "number" || typeof parsed.dayCount !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredReminder(reminder: StoredReminder | null): void {
  if (typeof localStorage === "undefined") return;
  if (!reminder) {
    localStorage.removeItem(REMINDER_STORAGE_KEY);
    return;
  }
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(reminder));
}

async function showViaServiceWorker(dayCount: number): Promise<boolean> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification("Last Day Words", {
      body: `Day ${dayCount} — don't break your lamp streak`,
      tag: STREAK_REMINDER_TAG,
      icon: "/pwa-192.png",
    });
    return true;
  } catch {
    return false;
  }
}

export async function showStreakAtRiskNotification(dayCount: number): Promise<void> {
  if (!canNotify()) return;
  const viaSw = await showViaServiceWorker(dayCount);
  if (viaSw) return;
  try {
    new Notification("Last Day Words", {
      body: `Day ${dayCount} — don't break your lamp streak`,
      tag: STREAK_REMINDER_TAG,
      icon: "/pwa-192.png",
    });
  } catch {
    /* unsupported in this context */
  }
}

/** Fire any persisted reminder whose deadline has passed (survives tab close until next open). */
export function checkDueStreakReminder(): void {
  const stored = readStoredReminder();
  if (!stored || Date.now() < stored.fireAt) return;
  writeStoredReminder(null);
  void showStreakAtRiskNotification(stored.dayCount);
}

function endOfLocalDayMs(now = Date.now()): number {
  const d = new Date(now);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function isSameLocalDay(ts: number, now = Date.now()): boolean {
  return new Date(ts).toDateString() === new Date(now).toDateString();
}

/** Schedule a same-day reminder; persisted locally and shown via service worker when possible. */
export function scheduleStreakReminder(dayCount: number, dailyDone: boolean): () => void {
  if (dailyDone || dayCount <= 0 || !canNotify()) {
    writeStoredReminder(null);
    return () => {};
  }
  const now = Date.now();
  // Clamp so the reminder lands before the day flips — a reminder after
  // midnight arrives when the streak is already broken.
  let fireAt = Math.min(now + STREAK_REMINDER_DELAY_MS, endOfLocalDayMs(now) - LAST_CALL_BUFFER_MS);
  if (fireAt <= now) fireAt = now + 60 * 1000; // opened very late: last call in a minute
  // Keep an earlier same-day deadline from a previous open — reopening the app
  // must not restart the countdown.
  const stored = readStoredReminder();
  if (stored && stored.fireAt > now && stored.fireAt < fireAt && isSameLocalDay(stored.fireAt, now)) {
    fireAt = stored.fireAt;
  }
  writeStoredReminder({ fireAt, dayCount });
  const id = window.setTimeout(() => {
    writeStoredReminder(null);
    void showStreakAtRiskNotification(dayCount);
  }, fireAt - now);
  return () => {
    window.clearTimeout(id);
    writeStoredReminder(null);
  };
}

export function clearStreakReminderSchedule(): void {
  writeStoredReminder(null);
}

export function getStoredReminderFireAt(): number | null {
  return readStoredReminder()?.fireAt ?? null;
}
