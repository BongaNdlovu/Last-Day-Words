import React from "react";

interface SoulLampProps {
  /** Remaining time as a fraction 0..1 */
  fuel: number;
  /** Seconds remaining, shown under the lamp */
  seconds: number;
  size?: number;
}

/**
 * Antique oil lamp used as the Speed Round countdown. The oil level and
 * flame shrink as time drains; the flame reddens and flickers faster in the
 * final seconds, and is snuffed out (smoke) when time is up.
 * Flicker/glow loops are auto-disabled under prefers-reduced-motion.
 */
export default function SoulLamp({ fuel, seconds, size = 120 }: SoulLampProps) {
  const f = Math.max(0, Math.min(1, fuel));
  const extinguished = f <= 0;
  const danger = f > 0 && f <= 0.25;

  // Oil reservoir fill (reservoir interior spans y 108..150)
  const oilTop = 150 - 42 * f;
  // Flame scales with remaining fuel
  const flameScale = extinguished ? 0 : 0.55 + 0.45 * f;
  const flameFill = danger ? "#f97316" : "#fde047";

  return (
    <div className="flex flex-col items-center gap-1 select-none" style={{ width: size }}>
      <svg viewBox="0 0 120 170" width={size} height={size * (170 / 120)} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="soulGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={danger ? "#f87171" : "#fbbf24"} stopOpacity="0.85" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="soulOil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="soulGlass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="soulBrass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e2a33a" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <clipPath id="soulReservoir">
            <path d="M 34,108 Q 30,150 60,150 Q 90,150 86,108 Z" />
          </clipPath>
        </defs>

        {/* Ambient glow */}
        {!extinguished && (
          <circle className="soul-glow" cx="60" cy="46" r="42" fill="url(#soulGlowGrad)" />
        )}

        {/* Flame or smoke */}
        {extinguished ? (
          <path d="M60 60 Q54 50 58 42 Q60 38 60 32 Q60 38 63 44 Q67 52 60 60"
            fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.5" />
        ) : (
          <g style={{ transform: `translateY(${(1 - flameScale) * 22}px) scale(${flameScale})`, transformOrigin: "60px 70px" }}>
            <path className={`soul-flame${danger ? " danger" : ""}`}
              d="M60 26 C50 44 48 56 54 66 C58 72 66 72 68 64 C72 54 70 42 60 26 Z"
              fill={flameFill} />
            <path d="M60 40 C56 52 56 60 60 66 C62 60 62 52 60 40 Z" fill="#fff7d6" opacity="0.85" />
          </g>
        )}

        {/* Wick + burner collar */}
        <rect x="56" y="66" width="8" height="10" fill="#3f3020" />
        <rect x="46" y="74" width="28" height="12" rx="2" fill="url(#soulBrass)" stroke="#fbbf24" strokeWidth="0.6" />
        <rect x="50" y="86" width="20" height="8" fill="#8a5a1e" />

        {/* Glass chimney */}
        <path d="M 50,66 Q 44,80 48,94 L 72,94 Q 76,80 70,66 Z" fill="url(#soulGlass)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />

        {/* Glass reservoir */}
        <path d="M 34,108 Q 30,150 60,150 Q 90,150 86,108 Z" fill="url(#soulGlass)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
        {/* Oil fill */}
        {!extinguished && (
          <g clipPath="url(#soulReservoir)">
            <rect x="30" y={oilTop} width="60" height={150 - oilTop} fill="url(#soulOil)" />
          </g>
        )}
        {/* Reservoir highlight */}
        <path d="M 40,112 Q 38,140 46,146" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />

        {/* Base */}
        <rect x="40" y="150" width="40" height="8" rx="2" fill="url(#soulBrass)" />
        <rect x="46" y="158" width="28" height="6" rx="2" fill="#5c3415" />
      </svg>
      <span className={`font-mono text-sm font-extrabold ${danger ? "text-rose-600" : "text-[#2a2018]"}`}>
        0:{seconds < 10 ? `0${seconds}` : seconds}
      </span>
    </div>
  );
}
