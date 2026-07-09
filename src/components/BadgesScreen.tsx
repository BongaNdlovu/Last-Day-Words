import React, { useState } from "react";
import { Award, ArrowLeft, Lock } from "lucide-react";
import { UserProgress } from "../types";
import { STREAK_BADGES } from "../utils/streaks";
import { motion, useReducedMotion } from "motion/react";

interface BadgesScreenProps {
  progress: UserProgress;
  onBack: () => void;
}

export default function BadgesScreen({ progress, onBack }: BadgesScreenProps) {
  const rm = useReducedMotion();
  const earned = new Set(progress.earnedBadgeIds ?? []);
  const streak = progress.dailyChallengeStreak ?? 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-2 px-2">
      <div className="flex items-center justify-between pb-4 border-b border-[#e2d2ac]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#5c4a33] hover:text-[#2a2018] font-medium py-1.5 px-3 hover:bg-[#f0e3c8] rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
        </button>
        <h2 className="text-lg font-display font-bold tracking-[0.1em] text-[#2a2018]">BADGE COLLECTION</h2>
        <div className="w-16" />
      </div>

      <p className="text-center text-sm text-[#5c4a33]">
        Streak milestones unlock lasting titles. Current streak:{" "}
        <strong className="text-[#92400e]">{streak} day{streak === 1 ? "" : "s"}</strong>
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
              className={`pcard rounded-2xl p-5 flex items-start gap-4 ${unlocked ? "parchment-glow border-[#d8c391]" : "opacity-70"}`}
            >
              <div
                className={`p-3 rounded-xl border ${
                  unlocked
                    ? "bg-[#2a2018] text-[#fbbf24] border-[#b45309]/40"
                    : "bg-[#f0e3c8] text-[#6b5537] border-[#e2d2ac]"
                }`}
              >
                {unlocked ? <Award className="w-6 h-6" aria-hidden="true" /> : <Lock className="w-6 h-6" aria-hidden="true" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-bold text-[#2a2018] text-lg">{badge.title}</h3>
                  {unlocked ? (
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">Earned</span>
                  ) : (
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-[#f3e8cf] text-[#6b5537] rounded">
                      {badge.threshold} days
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#5c4a33] mt-1">{badge.description}</p>
                {!unlocked && (
                  <div className="mt-2 w-full bg-[#e7d6b0] h-1.5 rounded-full overflow-hidden">
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
    </div>
  );
}
