/**
 * Fire a full-screen green (correct) or red (incorrect) flash.
 * Decoupled via a window event so any game mode can trigger it
 * without prop-drilling through the app.
 */
export function flashScreen(correct: boolean): void {
  window.dispatchEvent(new CustomEvent("game-flash", { detail: { correct } }));
}
