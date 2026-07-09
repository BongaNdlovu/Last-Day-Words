import React, { useEffect, useRef } from "react";

/**
 * Mounted once at the app root. Listens for "game-flash" window events
 * (dispatched via utils/flash.ts) and plays a full-screen green/red flash.
 */
export default function ScreenFlash() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const correct = (e as CustomEvent).detail?.correct;
      const el = ref.current;
      if (!el) return;
      // Restart the animation reliably
      el.className = "screen-flash";
      void el.offsetWidth;
      el.className = "screen-flash " + (correct ? "flash-correct" : "flash-incorrect");
    };
    window.addEventListener("game-flash", handler);
    return () => window.removeEventListener("game-flash", handler);
  }, []);

  return <div ref={ref} className="screen-flash" aria-hidden="true" />;
}
