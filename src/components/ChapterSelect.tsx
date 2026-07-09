import React, { useState } from "react";
import { ArrowLeft, Star, CheckCircle2, BookOpen, Shield } from "lucide-react";
import { UserProgress } from "../types";
import { chaptersData } from "../data/words";
import { getChapterMastery, MasteryTier } from "../utils/gameLogic";
import { CHAPTER_MASTERY_UNLOCKS } from "../data/studyContent";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";

interface ChapterSelectProps {
  progress: UserProgress;
  expertMode: boolean;
  onExpertModeChange: (on: boolean) => void;
  onSelectChapter: (chapterId: string) => void;
  onBack: () => void;
}

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export default function ChapterSelect({
  progress,
  expertMode,
  onExpertModeChange,
  onSelectChapter,
  onBack,
}: ChapterSelectProps) {
  const rm = useReducedMotion();
  const [unlockPreview, setUnlockPreview] = useState<{ chapterId: string; tier: MasteryTier } | null>(null);

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2 px-2">
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#e2d2ac]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#5c4a33] hover:text-[#2a2018] font-medium py-1.5 px-3 hover:bg-[#f0e3c8] rounded-lg transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Back to Menu</span>
        </button>
        <h2 className="text-lg sm:text-xl font-display font-bold tracking-[0.1em] text-[#2a2018]">
          CHAPTER CHALLENGE
        </h2>
        <div className="text-xs text-[#5c4a33] psunken px-2.5 py-1 rounded font-semibold">
          {chaptersData.length} <span className="hidden sm:inline">Prophetic Milestones</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pcard rounded-2xl p-4">
        <div className="flex items-center gap-2 text-sm text-[#5c4a33]">
          <Shield className="w-4 h-4 text-[#92400e]" aria-hidden="true" />
          <span>
            <strong className="text-[#2a2018]">Expert Mode</strong> — no hints, expert clues only, 20s lamp timer
          </span>
        </div>
        <button
          role="switch"
          aria-checked={expertMode}
          onClick={() => onExpertModeChange(!expertMode)}
          className={`relative w-14 h-8 rounded-full transition-colors cursor-pointer ${
            expertMode ? "bg-[#2a2018]" : "bg-[#e7d6b0]"
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-[#f8f1e3] transition-transform ${
              expertMode ? "translate-x-6" : ""
            }`}
          />
        </button>
      </div>

      <div className="text-center max-w-2xl mx-auto space-y-2">
        <p className="text-base text-[#52412c] leading-relaxed font-scripture italic">
          “Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.” <br />
          <span className="text-[#6b5537] font-sans text-xs not-italic tracking-wider uppercase">— 2 Timothy 2:15</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chaptersData.map((chapter, index) => {
          const solvedInChapter = chapter.words.filter((w) => progress.solvedWordIds.includes(w.id)).length;
          const totalInChapter = chapter.words.length;
          const isCompleted = solvedInChapter === totalInChapter;
          const stars = progress.chapterStars[chapter.id] || 0;
          const mastery = getChapterMastery(chapter, progress.wordStats);
          const unlockedTier = progress.masteryUnlocks?.[chapter.id] ?? 0;
          const nextUnlockTier = ([25, 50, 100] as const).find((t) => mastery.tier >= t && unlockedTier < t);

          return (
            <motion.div
              key={chapter.id}
              initial={rm ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rm ? 0 : index * 0.05 }}
              className={`pcard rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 parchment-glow hover:-translate-y-0.5 hover:border-[#b45309] ${
                isCompleted ? "border-[#d8c391]" : ""
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono text-[#6b5537] tracking-wider">
                    STAGE {ROMAN_NUMERALS[index]}
                  </span>

                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded font-semibold border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-100 text-emerald-700" aria-hidden="true" /> Finished
                    </span>
                  ) : solvedInChapter > 0 ? (
                    <span className="text-[11px] text-[#5c4a33] psunken px-2.5 py-0.5 rounded font-semibold">
                      In Progress: {solvedInChapter}/4
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#6b5537] bg-[#f3e8cf] px-2.5 py-0.5 rounded font-medium border border-[#ecdfc2]">
                      Unstarted
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-lg font-display font-bold text-[#2a2018] leading-snug tracking-wide">
                    {chapter.title}
                  </h4>
                  <p className="text-xs text-[#5c4a33] leading-relaxed mt-1 line-clamp-2">
                    {chapter.description}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                    <span className="text-[#6b5537]">Mastery · {mastery.masteredCount}/{mastery.total}</span>
                    <span className="text-[#92400e]">
                      {mastery.percent}%
                      {mastery.tier > 0 ? ` · Tier ${mastery.tier}%` : ""}
                    </span>
                  </div>
                  <div className="w-full bg-[#e7d6b0] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#b45309] to-[#f59e0b] h-full rounded-full transition-all duration-500"
                      style={{ width: `${mastery.percent}%` }}
                    />
                  </div>
                  {unlockedTier > 0 && (
                    <button
                      onClick={() => setUnlockPreview({ chapterId: chapter.id, tier: unlockedTier as MasteryTier })}
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#92400e] cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" /> Scripture unlocks available
                    </button>
                  )}
                  {nextUnlockTier && unlockedTier < nextUnlockTier && mastery.tier >= nextUnlockTier && (
                    <span className="mt-1 block text-[10px] text-emerald-800 font-semibold">New unlock ready at {nextUnlockTier}%!</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#ecdfc2]">
                <div className="flex items-center gap-1.5" aria-label={`${stars} of 3 stars`}>
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      aria-hidden="true"
                      className={`w-4 h-4 ${
                        s <= stars ? "text-[#b45309] fill-[#b45309]" : "text-[#cbb487] fill-[#e0d0aa]"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => onSelectChapter(chapter.id)}
                  className={`text-xs font-semibold py-1.5 px-3.5 rounded-lg transition-all cursor-pointer ${
                    isCompleted
                      ? "bg-[#f0e3c8] text-[#3a2c1e] hover:bg-[#e8d7b3] border border-[#e2d2ac]"
                      : "bg-[#2a2018] text-[#f8f1e3] hover:bg-[#1c140d]"
                  }`}
                >
                  {isCompleted ? "Replay Chapter" : solvedInChapter > 0 ? "Continue" : "Begin Stage"}
                  {expertMode ? " · Expert" : ""}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {unlockPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#2a2018]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            onClick={() => setUnlockPreview(null)}
          >
            <motion.div
              initial={rm ? false : { scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="pcard rounded-2xl p-6 max-w-lg w-full space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display font-bold text-xl text-[#2a2018]">Mastery Scripture Unlocks</h3>
              {([25, 50, 100] as const).map((tier) => {
                const passage = CHAPTER_MASTERY_UNLOCKS[unlockPreview.chapterId]?.[tier];
                const unlocked = (progress.masteryUnlocks?.[unlockPreview.chapterId] ?? 0) >= tier;
                if (!passage) return null;
                return (
                  <div
                    key={tier}
                    className={`psunken rounded-xl p-4 ${unlocked ? "" : "opacity-50"}`}
                  >
                    <div className="text-[10px] uppercase font-bold tracking-wider text-[#6b5537] mb-1">
                      {tier}% · {unlocked ? passage.citation : "Locked"}
                    </div>
                    {unlocked ? (
                      <p className="text-sm font-scripture italic text-[#2a2018] leading-relaxed">“{passage.text}”</p>
                    ) : (
                      <p className="text-sm text-[#6b5537]">Reach {tier}% mastery to unlock.</p>
                    )}
                  </div>
                );
              })}
              <button
                onClick={() => setUnlockPreview(null)}
                className="w-full py-2 bg-[#2a2018] text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
