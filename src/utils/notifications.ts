/** Browser Notification helpers for streak-at-risk reminders (PWA-friendly). */

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function canNotify(): boolean {
  return typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted";
}

export function showStreakAtRiskNotification(dayCount: number): void {
  if (!canNotify()) return;
  try {
    new Notification("Last Day Words", {
      body: `Day ${dayCount} — don't break your lamp streak`,
      tag: "streak-at-risk",
      icon: "/pwa-192.png",
    });
  } catch {
    // Some browsers require a service worker registration for Notification
  }
}

/** Schedule a same-day reminder check while the tab is open. */
export function scheduleStreakReminder(dayCount: number, dailyDone: boolean): () => void {
  if (dailyDone || dayCount <= 0 || !canNotify()) return () => {};
  // Fire once after ~2 hours if still on the page and incomplete (light nudge)
  const id = window.setTimeout(() => {
    showStreakAtRiskNotification(dayCount);
  }, 2 * 60 * 60 * 1000);
  return () => window.clearTimeout(id);
}
