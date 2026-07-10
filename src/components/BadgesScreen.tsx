import { Award, ArrowLeft, Lock, Sparkles } from "lucide-react";
import { UserProgress } from "../types";
import { STREAK_BADGES } from "../utils/streaks";
import { LEADERBOARD_BADGES } from "../utils/leaderboard";
import { COSMETICS } from "../data/cosmetics";
import { progressToNextRank } from "../data/ranks";
import { motion, useReducedMotion } from "motion/react";

interface BadgesScreenProps {
  progress: UserProgress;
  onSelectCosmetic?: (cosmeticId: string) => void;
  onBack: () => void;
}

export default function BadgesScreen({ progress, onSelectCosmetic, onBack }: BadgesScreenProps) {
  const rm = useReducedMotion();
  const earned = new Set(progress.earnedBadgeIds ?? []);
  const streak = progress.dailyChallengeStreak ?? 0;
  const unlockedCosmetics = new Set(progress.unlockedCosmetics ?? ["candle-classic"]);
  const xp = progress.xp ?? 0;
  const rankInfo = progressToNextRank(xp);

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-2 px-2">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#c9c2b4] hover:text-[#f4f1ea] font-medium py-1.5 px-3 hover:bg-white/10 rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
        </button>
        <h2 className="text-lg font-display font-bold tracking-[0.1em] text-[#f4f1ea]">BADGES &amp; RANKS</h2>
        <div className="w-16" />
      </div>

      <div className="pcard rounded-2xl p-5 parchment-glow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-[#f4f1ea]">{rankInfo.current.title}</span>
          <span className="font-mono text-sm font-bold text-[#fbbf24]">{xp} XP</span>
        </div>
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#b45309] to-[#f59e0b] h-full rounded-full"
            style={{ width: `${Math.round(rankInfo.ratio * 100)}%` }}
          />
        </div>
        <p className="text-[11px] text-[#a49b8d] mt-2">
          {rankInfo.next
            ? `${rankInfo.xpInto} / ${rankInfo.xpNeeded} XP until ${rankInfo.next.title}`
            : "Highest rank reached"}
        </p>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#a49b8d] mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Cosmetics
        </h3>
        <div className="space-y-3">
          {COSMETICS.map((c, i) => {
            const unlocked = unlockedCosmetics.has(c.id);
            const selected =
              c.kind === "candle"
                ? (progress.selectedCandle ?? "candle-classic") === c.id
                : (progress.selectedBanner ?? "") === c.id;
            return (
              <motion.div
                key={c.id}
                initial={rm ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rm ? 0 : i * 0.04 }}
                className={`pcard rounded-2xl p-4 flex items-start gap-3 ${unlocked ? "" : "opacity-70"}`}
              >
                <div
                  className={`p-2.5 rounded-xl border ${
                    unlocked
                      ? "bg-[#101014] text-[#fbbf24] border-[#f5b301]/40"
                      : "bg-white/[0.08] text-[#a49b8d] border-white/10"
                  }`}
                >
                  {unlocked ? <Sparkles className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-[#f4f1ea] text-sm">{c.title}</h4>
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-white/[0.08] text-[#a49b8d] rounded">
                      {c.kind}
                    </span>
                    {selected && unlocked && (
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#c9c2b4] mt-0.5">{c.description}</p>
                  {!unlocked && (
                    <p className="text-[10px] text-[#fbbf24] font-semibold mt-1">
                      Unlocks at {c.unlockRank.replace("-", " ")} rank
                    </p>
                  )}
                  {unlocked && onSelectCosmetic && !selected && (
                    <button
                      onClick={() => onSelectCosmetic(c.id)}
                      className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#fbbf24] hover:underline cursor-pointer"
                    >
                      Equip
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-sm text-[#c9c2b4]">
        Streak milestones unlock lasting titles. Current streak:{" "}
        <strong className="text-[#fbbf24]">{streak} day{streak === 1 ? "" : "s"}</strong>
      </p>

      <div className="space-y-3">
        {STREAK_BADGES.map((badge, i) => {
          const unlocked = earned.has(badge.id) || streak >= badge.threshold;
          return (
            <motion.div
              key={badge.id}
              initial={rm ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rm ? 0 : i * 0.05 }}
              className={`pcard rounded-2xl p-5 flex items-start gap-4 ${unlocked ? "parchment-glow border-[#f5b301]/35" : "opacity-70"}`}
            >
              <div
                className={`p-3 rounded-xl border ${
                  unlocked
                    ? "bg-[#101014] text-[#fbbf24] border-[#f5b301]/40"
                    : "bg-white/[0.08] text-[#a49b8d] border-white/10"
                }`}
              >
                {unlocked ? <Award className="w-6 h-6" aria-hidden="true" /> : <Lock className="w-6 h-6" aria-hidden="true" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-bold text-[#f4f1ea] text-lg">{badge.title}</h3>
                  {unlocked ? (
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">Earned</span>
                  ) : (
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-white/[0.08] text-[#a49b8d] rounded">
                      {badge.threshold} days
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#c9c2b4] mt-1">{badge.description}</p>
                {!unlocked && (
                  <div className="mt-2 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#b45309] to-[#f59e0b] h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.round((streak / badge.threshold) * 100))}%` }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#a49b8d] mb-3 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" /> Weekly leaderboard
        </h3>
        <p className="text-xs text-[#c9c2b4] mb-3">
          Top-three badges are live for the current SAST week and are removed if you drop below #3.
          Boards reset Sunday 00:00 SAST (end of Saturday).
        </p>
        <div className="space-y-3">
          {LEADERBOARD_BADGES.map((badge, i) => {
            const unlocked = earned.has(badge.id);
            const placeLabel = badge.threshold === 1 ? "#1" : badge.threshold === 2 ? "#2" : "#3";
            return (
              <motion.div
                key={badge.id}
                initial={rm ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rm ? 0 : 0.15 + i * 0.04 }}
                className={`pcard rounded-2xl p-5 flex items-start gap-4 ${unlocked ? "parchment-glow border-[#f5b301]/35" : "opacity-70"}`}
              >
                <div
                  className={`p-3 rounded-xl border ${
                    unlocked
                      ? "bg-[#101014] text-[#fbbf24] border-[#f5b301]/40"
                      : "bg-white/[0.08] text-[#a49b8d] border-white/10"
                  }`}
                >
                  {unlocked ? <Award className="w-6 h-6" aria-hidden="true" /> : <Lock className="w-6 h-6" aria-hidden="true" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-[#f4f1ea] text-lg">{badge.title}</h3>
                    {unlocked ? (
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                        Earned
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-white/[0.08] text-[#a49b8d] rounded">
                        Top {placeLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#c9c2b4] mt-1">{badge.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
