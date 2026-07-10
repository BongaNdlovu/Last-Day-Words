import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { MAX_MISTAKES } from "../utils/gameLogic";

export type CandleStyleToken = "classic" | "emerald" | "sapphire" | string;

interface PropheticCandlesProps {
  mistakes: number;
  maxMistakes?: number;
  compact?: boolean;
  /** Cosmetic candle style: classic | emerald | sapphire (or cosmetic id). */
  style?: CandleStyleToken;
}

const FLAME_PALETTES: Record<string, { base: string; mid: string; tip: string; glow: string; bodyLit: string; baseLit: string }> = {
  classic: {
    base: "#F59E0B",
    mid: "#FBBF24",
    tip: "#FEF3C7",
    glow: "rgba(251, 191, 36, 0.45)",
    bodyLit: "from-amber-50 to-amber-100",
    baseLit: "from-amber-800 to-amber-950",
  },
  emerald: {
    base: "#059669",
    mid: "#34D399",
    tip: "#D1FAE5",
    glow: "rgba(52, 211, 153, 0.45)",
    bodyLit: "from-emerald-50 to-emerald-100",
    baseLit: "from-emerald-800 to-emerald-950",
  },
  sapphire: {
    base: "#2563EB",
    mid: "#60A5FA",
    tip: "#DBEAFE",
    glow: "rgba(96, 165, 250, 0.45)",
    bodyLit: "from-sky-50 to-blue-100",
    baseLit: "from-blue-800 to-blue-950",
  },
};

function resolvePalette(style?: string) {
  const token = (style ?? "classic").replace(/^candle-/, "");
  return FLAME_PALETTES[token] ?? FLAME_PALETTES.classic;
}

function flameGradientId(index: number, palette: (typeof FLAME_PALETTES)["classic"]): string {
  return `flameGrad-${index}-${palette.base.replace(/[^A-Za-z0-9_-]/g, "")}`;
}

function Candle({
  lit,
  index,
  compact,
  palette,
}: {
  key?: number;
  lit: boolean;
  index: number;
  compact?: boolean;
  palette: (typeof FLAME_PALETTES)["classic"];
}) {
  const w = compact ? 22 : 28;
  const gradientId = flameGradientId(index, palette);

  return (
    <div className="relative flex flex-col items-center" style={{ width: w }}>
      <AnimatePresence mode="wait">
        {lit ? (
          <motion.div
            key="flame"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.3, y: -8 }}
            transition={{ duration: 0.4 }}
            className="relative mb-0.5"
            style={{ height: compact ? 20 : 26 }}
          >
            <div
              className="candle-flame-glow absolute inset-0 rounded-full blur-md"
              style={{ animationDelay: `${index * 0.18}s`, backgroundColor: palette.glow }}
            />
            <svg
              viewBox="0 0 24 32"
              width={compact ? 14 : 18}
              height={compact ? 20 : 26}
              className="relative z-10 candle-flame-flicker"
              style={{ animationDelay: `${index * 0.22}s` }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor={palette.base} />
                  <stop offset="45%" stopColor={palette.mid} />
                  <stop offset="100%" stopColor={palette.tip} />
                </linearGradient>
              </defs>
              <ellipse cx="12" cy="26" rx="5" ry="3" fill={palette.base} opacity="0.5" />
              <path
                d="M12 4 C8 12, 7 18, 9 24 C10 27, 14 27, 15 24 C17 18, 16 12, 12 4Z"
                fill={`url(#${gradientId})`}
              />
              <path
                d="M12 10 C11 16, 11 20, 12 22 C12.5 20, 12.5 16, 12 10Z"
                fill={palette.tip}
                opacity="0.7"
              />
            </svg>
          </motion.div>
        ) : (
          <motion.div
            key="smoke"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: [0.6, 0.3, 0], y: -12 }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            className="flex items-end justify-center mb-1"
            style={{ height: compact ? 20 : 26 }}
          >
            <svg viewBox="0 0 20 24" width={compact ? 12 : 16} height={compact ? 16 : 20}>
              <path
                d="M10 20 Q6 14, 8 8 Q10 4, 10 0 Q10 4, 12 8 Q14 14, 10 20"
                fill="none"
                stroke="#a8926a"
                strokeWidth="1.5"
                opacity="0.5"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`relative rounded-t-sm transition-all duration-700 ${
          lit ? `bg-gradient-to-b ${palette.bodyLit}` : "bg-white/20"
        }`}
        style={{ width: compact ? 10 : 12, height: compact ? 22 : 28 }}
      >
        {lit && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-200/80 rounded-t-sm candle-wick-melt" />
        )}
        <div
          className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded-full ${
            lit ? "bg-white/20" : "bg-white/30"
          }`}
          style={{ width: compact ? 3 : 4, height: compact ? 3 : 4 }}
        />
      </div>

      <div
        className={`rounded-b-md transition-colors duration-500 ${
          lit ? `bg-gradient-to-b ${palette.baseLit}` : "bg-white/25"
        }`}
        style={{ width: w, height: compact ? 6 : 8 }}
      />
    </div>
  );
}

export default function PropheticCandles({
  mistakes,
  maxMistakes = MAX_MISTAKES,
  compact = false,
  style = "classic",
}: PropheticCandlesProps) {
  const palette = resolvePalette(style);
  const rm = useReducedMotion();
  const remaining = maxMistakes - mistakes;
  const isDanger = remaining <= 2 && remaining > 0;

  return (
    <motion.div
      animate={isDanger && !rm ? { scale: [1, 1.01, 1] } : { scale: 1 }}
      transition={isDanger && !rm ? { repeat: Infinity, duration: 1.2 } : undefined}
      className={`bg-gradient-to-b from-[#1a1a20] to-[#232329] py-4 px-4 rounded-xl flex flex-col items-center justify-center gap-2.5 parchment-glow transition-colors duration-300 ${
        isDanger ? "border-2 border-rose-300 danger-pulse" : "border border-white/15"
      }`}
    >
      <span className="text-[10px] uppercase tracking-wider font-bold text-[#a49b8d]">
        Prophetic Lamps
      </span>
      <div className={`flex items-end ${compact ? "gap-2" : "gap-3"}`}>
        {Array.from({ length: maxMistakes }, (_, i) => (
          <Candle key={i} index={i} lit={i >= mistakes} compact={compact} palette={palette} />
        ))}
      </div>
      {mistakes > 0 && mistakes < maxMistakes && (
        <motion.span
          initial={rm ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-[10px] font-medium ${isDanger ? "text-rose-700 font-bold" : "text-[#fbbf24]"}`}
        >
          {isDanger ? `Only ${remaining} lamp${remaining !== 1 ? "s" : ""} left!` : `${remaining} lamp${remaining !== 1 ? "s" : ""} remain lit`}
        </motion.span>
      )}
      {mistakes >= maxMistakes && (
        <motion.span
          initial={rm ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-700 font-bold"
        >
          All lamps extinguished
        </motion.span>
      )}
    </motion.div>
  );
}
