import React, { useMemo } from "react";
import { Award, Book, ArrowRight, Star, RefreshCw, Lightbulb, Sparkles } from "lucide-react";
import { WordTerm } from "../data/words";
import { getRandomFunFact } from "../data/funFacts";
import { StudyPassage } from "../data/studyContent";
import { calcStars } from "../utils/gameLogic";
import { motion, useReducedMotion } from "motion/react";

interface VerseLinkBonusModalProps {
  word: WordTerm;
  mistakes: number;
  hintsUsed?: number;
  chapterTitle: string;
  isLastWord: boolean;
  isDailyBonus?: boolean;
  scriptureBonus?: StudyPassage | null;
  fragment?: StudyPassage | null;
  masteryUnlock?: StudyPassage | null;
  onNext: () => void;
  onRetry: () => void;
}

export default function VerseLinkBonusModal({
  word,
  mistakes,
  hintsUsed = 0,
  chapterTitle,
  isLastWord,
  isDailyBonus = false,
  scriptureBonus = null,
  fragment = null,
  masteryUnlock = null,
  onNext,
  onRetry,
}: VerseLinkBonusModalProps) {
  const rm = useReducedMotion();
  const funFact = useMemo(() => getRandomFunFact(), [word.id]);
  const stars = calcStars(mistakes, hintsUsed);

  const getEncouragementText = () => {
    if (stars === 3) return "FAITHFUL & SCRIPTURAL!";
    if (stars === 2) return "PROPHETICALLY CORRECT!";
    if (stars === 1) return "WORD SOLVED!";
    return "STUDY COMPLETED!";
  };

  return (
    <div className="fixed inset-0 bg-[#2a2018]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={rm ? false : { opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="pcard rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 psunken text-[#5c4a33] rounded-full text-[10px] font-bold tracking-wider uppercase">
            <Award className="w-3.5 h-3.5 text-[#b45309]" aria-hidden="true" />
            {getEncouragementText()}
          </div>
          <p className="text-xs text-[#6b5537] uppercase tracking-[0.2em] font-bold">
            {chapterTitle}
            {isDailyBonus ? " · 2× Daily Bonus Word" : ""}
          </p>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-[0.06em] text-[#2a2018]">
            {word.word}
          </h2>
          <div className="flex items-center justify-center gap-1.5 py-1" aria-label={`${stars} of 3 stars`}>
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                aria-hidden="true"
                className={`w-6 h-6 ${
                  s <= stars ? "text-[#b45309] fill-[#b45309]" : "text-[#cbb487] fill-[#e0d0aa]"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-[#6b5537] font-medium">
            {stars > 0 ? `Earned ${stars} of 3 prophecy stars` : "Deciphered with maximum attempts"}
          </p>
          {stars === 3 && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#2a2018] text-[#fbbf24] rounded-full text-[10px] font-bold uppercase tracking-wider">★ Mastered</div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="h-[1px] bg-gradient-to-r from-transparent to-[#d8c391] flex-1" />
          <Book className="w-5 h-5 text-[#b45309]" aria-hidden="true" />
          <div className="h-[1px] bg-gradient-to-l from-transparent to-[#d8c391] flex-1" />
        </div>

        <div className="relative psunken rounded-xl p-5 md:p-6 shadow-inner space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#6b5537] uppercase tracking-widest mb-1">
            <span>Verse Link:</span>
            <span className="text-[#2a2018] font-mono font-extrabold px-2 py-0.5 bg-[#e7d6b0] rounded border border-[#d8c391]">
              {word.verse}
            </span>
          </div>
          <p className="text-lg md:text-xl font-scripture italic text-[#2a2018] leading-relaxed text-center font-medium">
            “{word.scripture}”
          </p>
        </div>

        <div className="psunken rounded-xl p-4 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-[#6b5537] tracking-wider block">
            Prophetic Significance (Last Day Events)
          </span>
          <p className="text-xs sm:text-sm text-[#52412c] leading-relaxed">{word.summary}</p>
        </div>

        {scriptureBonus && (
          <div className="bg-[#2a2018] text-[#f8f1e3] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#fbbf24] text-[10px] uppercase font-bold tracking-wider">
              <Sparkles className="w-4 h-4" /> Scripture Bonus (Perfect Solve)
            </div>
            <p className="text-sm font-scripture italic leading-relaxed">“{scriptureBonus.text}”</p>
            <p className="text-[10px] text-[#cbb487]">— {scriptureBonus.citation}</p>
          </div>
        )}

        {fragment && (
          <div className="bg-[#fbeccb] border border-[#e6c98a] rounded-xl p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#b45309] tracking-wider">Mystery Fragment Found</span>
            <p className="text-xs text-[#52412c] font-scripture italic">“{fragment.text}”</p>
            <p className="text-[10px] text-[#6b5537]">— {fragment.citation}</p>
          </div>
        )}

        {masteryUnlock && (
          <div className="border border-emerald-300 bg-emerald-50 rounded-xl p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Mastery Scripture Unlocked</span>
            <p className="text-xs text-[#52412c] font-scripture italic">“{masteryUnlock.text}”</p>
            <p className="text-[10px] text-emerald-800">— {masteryUnlock.citation}</p>
          </div>
        )}

        <div className="flex items-start gap-3 bg-[#fbeccb] border border-[#e6c98a] rounded-xl p-4">
          <div className="shrink-0 mt-0.5 text-[#b45309]"><Lightbulb className="w-5 h-5" aria-hidden="true" /></div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#b45309] tracking-wider block mb-0.5">Did you know?</span>
            <p className="text-xs sm:text-sm text-[#52412c] leading-relaxed">{funFact}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {stars < 3 && (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2.5 px-5 border border-[#e2d2ac] bg-[#fbf5e9] text-[#3a2c1e] hover:bg-[#f3e8cf] font-semibold rounded-lg text-xs transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Replay for Perfect Stars
            </button>
          )}
          <button
            onClick={onNext}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-8 bg-[#2a2018] hover:bg-[#1c140d] text-[#f8f1e3] font-bold uppercase tracking-widest text-xs rounded-lg transition-all cursor-pointer parchment-glow"
          >
            {isLastWord ? "Complete Chapter" : "Solve Next Word"}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
