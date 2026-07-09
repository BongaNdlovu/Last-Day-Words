import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Lightbulb, RefreshCw, Star, Eye, Zap } from "lucide-react";
import { WordTerm, Chapter } from "../data/words";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import confetti from "canvas-confetti";
import {
  isLetter,
  normalizeWord,
  isWordSolved,
  calcStars,
  getWordDifficulty,
  getMaxMistakes,
  getDepthHint,
  getExpertModeClue,
  pickRandomHintLetter,
  getStreakLabel,
  vibrate,
  MAX_HINTS_PER_WORD,
  HINT_MISTAKE_PENALTY,
  EXPERT_MODE_LAMP_TIME,
} from "../utils/gameLogic";
import PropheticCandles from "./PropheticCandles";
import KeyboardGrid from "./KeyboardGrid";
import WordSlots from "./WordSlots";
import GameFeedback, { FeedbackTone } from "./GameFeedback";
import EllenWhiteAvatar, { AvatarReaction } from "./EllenWhiteAvatar";
import SoulLamp from "./SoulLamp";
import { flashScreen } from "../utils/flash";

interface WordRevealGameProps {
  chapter: Chapter;
  wordIndex: number;
  expertMode?: boolean;
  onBack: () => void;
  onSolveComplete: (word: WordTerm, mistakes: number, hintsUsed: number) => void;
}

export default function WordRevealGame({
  chapter,
  wordIndex,
  expertMode = false,
  onBack,
  onSolveComplete,
}: WordRevealGameProps) {
  const rm = useReducedMotion();
  const currentWordObj = chapter.words[wordIndex];
  const wordText = normalizeWord(currentWordObj.word);
  const difficulty = getWordDifficulty(currentWordObj);
  const maxMistakes = getMaxMistakes(difficulty);

  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [letterStreak, setLetterStreak] = useState(0);
  const [showConfirmBack, setShowConfirmBack] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; tone: FeedbackTone } | null>(null);
  const [shaking, setShaking] = useState(false);
  const [reaction, setReaction] = useState<AvatarReaction>("idle");
  const [lampSeconds, setLampSeconds] = useState(EXPERT_MODE_LAMP_TIME);
  const feedbackTimer = useRef<NodeJS.Timeout | null>(null);
  const reactionTimer = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false);

  const solved = isWordSolved(wordText, guessedLetters);
  const depthHint = expertMode ? null : getDepthHint(currentWordObj, mistakes, difficulty);
  const starsCount = calcStars(mistakes, expertMode ? 0 : hintsUsed);
  const streakLabel = getStreakLabel(letterStreak);
  const clueText = expertMode ? getExpertModeClue(currentWordObj) : currentWordObj.clue;

  const showFeedback = useCallback((text: string, tone: FeedbackTone) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback({ text, tone });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 1400);
  }, []);

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 350);
  }, []);

  // Drive Ellen White's reaction, auto-returning to idle
  const flashReaction = useCallback((r: AvatarReaction) => {
    setReaction(r);
    if (reactionTimer.current) clearTimeout(reactionTimer.current);
    reactionTimer.current = setTimeout(() => setReaction("idle"), 1500);
  }, []);

  const makeGuess = useCallback(
    (letter: string) => {
      const upperLetter = letter.toUpperCase();
      if (!isLetter(upperLetter) || guessedLetters.includes(upperLetter)) return;
      if (mistakes >= maxMistakes || solved) return;

      setGuessedLetters((prev) => [...prev, upperLetter]);
      if (!wordText.includes(upperLetter)) {
        setMistakes((prev) => prev + 1);
        setLetterStreak(0);
        vibrate([80, 50, 80]);
        triggerShake();
        flashReaction("incorrect");
        flashScreen(false);
        if (maxMistakes - mistakes <= 2) showFeedback("Wrong!", "danger");
      } else {
        setLetterStreak((s) => {
          const next = s + 1;
          const label = getStreakLabel(next);
          if (label) showFeedback(label, "streak");
          return next;
        });
        vibrate(40);
        flashReaction("correct");
        flashScreen(true);
      }
    },
    [guessedLetters, wordText, mistakes, solved, maxMistakes, triggerShake, showFeedback, flashReaction]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showConfirmBack) return;
      const key = e.key.toUpperCase();
      if (isLetter(key) && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        makeGuess(key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [makeGuess, showConfirmBack]);

  useEffect(() => {
    setGuessedLetters([]);
    setMistakes(0);
    setHintsUsed(0);
    setLetterStreak(0);
    setShowConfirmBack(false);
    setFeedback(null);
    setReaction("idle");
    setLampSeconds(EXPERT_MODE_LAMP_TIME);
    completedRef.current = false;
    if (reactionTimer.current) clearTimeout(reactionTimer.current);
  }, [wordIndex, currentWordObj]);

  useEffect(() => {
    if (!expertMode || solved || mistakes >= maxMistakes) return;
    if (lampSeconds <= 0) {
      setMistakes(maxMistakes);
      return;
    }
    const id = window.setTimeout(() => setLampSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [expertMode, lampSeconds, solved, mistakes, maxMistakes]);

  useEffect(() => {
    if (solved && wordText.length > 0 && !completedRef.current) {
      completedRef.current = true;
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.65 }, colors: ["#F59E0B", "#2a2018", "#10B981"] });
      const timer = setTimeout(() => onSolveComplete(currentWordObj, mistakes, expertMode ? 0 : hintsUsed), 900);
      return () => clearTimeout(timer);
    }
  }, [solved, currentWordObj, mistakes, hintsUsed, expertMode, onSolveComplete, wordText]);

  const handleRevealHint = () => {
    if (expertMode || solved || mistakes >= maxMistakes || hintsUsed >= MAX_HINTS_PER_WORD) return;
    const letter = pickRandomHintLetter(wordText, guessedLetters);
    if (letter) {
      setGuessedLetters((prev) => [...prev, letter]);
      setHintsUsed((prev) => prev + 1);
      setMistakes((m) => Math.min(maxMistakes, m + HINT_MISTAKE_PENALTY));
      setLetterStreak(0);
      showFeedback("Hint costs a lamp!", "danger");
    }
  };

  const handleResetWord = () => {
    setGuessedLetters([]);
    setMistakes(0);
    setHintsUsed(0);
    setLetterStreak(0);
  };

  return (
    <motion.div
      animate={shaking && !rm ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 max-w-4xl mx-auto py-2 px-2 select-none relative"
    >
      <GameFeedback text={feedback?.text ?? null} tone={feedback?.tone} />

      <div className="flex items-center justify-between pb-3 border-b border-[#e2d2ac]">
        <button
          onClick={() => {
            if (guessedLetters.length > 0 && !solved) setShowConfirmBack(true);
            else onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-[#5c4a33] hover:text-[#2a2018] font-medium py-1.5 px-3 hover:bg-[#f0e3c8] rounded-lg transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Abandon Run
        </button>

        <div className="text-center">
          <div className="text-[10px] text-[#6b5537] font-bold uppercase tracking-[0.15em]">{chapter.title}</div>
          <div className="text-xs text-[#5c4a33] font-medium">Term {wordIndex + 1} of {chapter.words.length}</div>
        </div>

        <div className="flex items-center gap-2">
          {streakLabel && (
            <span className="flex items-center gap-1 text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-[#f4dca6] text-[#92400e] animate-pulse">
              <Zap className="w-3 h-3" aria-hidden="true" /> {streakLabel}
            </span>
          )}
          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
            difficulty === "easy" ? "bg-emerald-50 text-emerald-800" :
            difficulty === "medium" ? "bg-amber-100 text-[#92400e]" : "bg-rose-50 text-rose-800"
          }`}>{difficulty}</span>
          <div className="flex items-center gap-1 text-xs font-semibold text-[#5c4a33] psunken px-2.5 py-1.5 rounded" aria-label={`${starsCount} of 3 stars`}>
            {[1, 2, 3].map((s) => (
              <Star key={s} aria-hidden="true" className={`w-3.5 h-3.5 ${s <= starsCount ? "text-[#b45309] fill-[#b45309]" : "text-[#cbb487] fill-[#e0d0aa]"}`} />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showConfirmBack && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#2a2018]/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div initial={rm ? false : { scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="pcard rounded-2xl p-6 max-w-sm w-full shadow-xl text-center space-y-4">
              <h4 className="text-lg font-display font-bold text-[#2a2018]">Abandon Word?</h4>
              <p className="text-sm text-[#5c4a33]">You will lose progress on this term.</p>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setShowConfirmBack(false)} className="flex-1 py-2 border border-[#e2d2ac] bg-[#fbf5e9] hover:bg-[#f3e8cf] text-[#2a2018] rounded-lg text-xs cursor-pointer">Keep Playing</button>
                <button onClick={onBack} className="flex-1 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs cursor-pointer">Abandon</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center">
        <EllenWhiteAvatar reaction={reaction} size={148} />
      </div>

      <motion.div initial={rm ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="pcard rounded-2xl p-6 md:p-8 text-center space-y-4 parchment-glow relative">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.15em] font-bold text-[#6b5537] psunken px-2 py-0.5 rounded">
          {expertMode ? "expert clue" : "clue"}
        </div>
        <p className="text-xl md:text-2xl font-light text-[#2a2018] leading-relaxed pt-2">"{clueText}"</p>
        <AnimatePresence>
          {depthHint && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }}
              className="text-xs text-[#92400e] bg-[#fbeccb] border border-[#e6c98a] rounded-lg px-4 py-2.5 leading-relaxed max-w-lg mx-auto">
              <span className="text-[9px] uppercase font-bold tracking-wider block mb-1 text-[#b45309]">Deeper Study</span>
              {depthHint}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {expertMode ? (
        <div className="flex justify-center">
          <SoulLamp fuel={lampSeconds / EXPERT_MODE_LAMP_TIME} seconds={lampSeconds} />
        </div>
      ) : (
        <PropheticCandles mistakes={mistakes} maxMistakes={maxMistakes} />
      )}

      <WordSlots wordText={wordText} guessedLetters={guessedLetters} mistakes={mistakes} maxMistakes={maxMistakes} />

      <div className="flex items-center justify-center gap-3 flex-wrap">
        {!expertMode && (
          <button onClick={handleRevealHint} disabled={mistakes >= maxMistakes || solved || hintsUsed >= MAX_HINTS_PER_WORD}
            className="flex items-center gap-1.5 py-2 px-4 bg-[#f0e3c8] hover:bg-[#e8d7b3] disabled:opacity-50 rounded-lg text-xs font-semibold border border-[#e2d2ac] text-[#3a2c1e] cursor-pointer">
            <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" /> Hint ({hintsUsed}/{MAX_HINTS_PER_WORD})
          </button>
        )}
        <button onClick={handleResetWord}
          className="flex items-center gap-1.5 py-2 px-4 bg-[#fbf5e9] hover:bg-[#f3e8cf] rounded-lg text-xs font-semibold border border-[#e2d2ac] text-[#3a2c1e] cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" /> Clear Board
        </button>
        <button onClick={() => setMistakes(maxMistakes)} disabled={mistakes >= maxMistakes || solved}
          className="flex items-center gap-1.5 py-2 px-4 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-800 rounded-lg text-xs font-semibold border border-red-200 cursor-pointer">
          <Eye className="w-3.5 h-3.5" aria-hidden="true" /> I Give Up
        </button>
      </div>

      <KeyboardGrid guessedLetters={guessedLetters} wordText={wordText} onGuess={makeGuess} disabled={mistakes >= maxMistakes || solved} />

      <AnimatePresence>
        {mistakes >= maxMistakes && !solved && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#2a2018]/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div initial={rm ? false : { scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }}
              className="pcard rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-5">
              <div className="w-12 h-12 bg-red-50 text-red-800 rounded-full flex items-center justify-center mx-auto text-xl font-bold border border-red-200">!</div>
              <h3 className="text-xl font-display font-bold text-[#2a2018]">Lamps Extinguished</h3>
              <p className="text-sm text-[#5c4a33]">The term was: <strong className="font-mono text-[#2a2018]">{wordText}</strong></p>
              <div className="psunken p-4 rounded-xl text-left space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#6b5537] block">Prophetic Scripture</span>
                <p className="text-sm font-scripture italic leading-relaxed text-[#2a2018]">"{currentWordObj.scripture}"</p>
                <span className="text-[10px] text-[#6b5537] text-right block font-semibold">— {currentWordObj.verse}</span>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button onClick={handleResetWord} className="w-full py-2.5 bg-[#2a2018] hover:bg-[#1c140d] text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer">Try Again</button>
                <button onClick={() => onSolveComplete(currentWordObj, mistakes, expertMode ? 0 : hintsUsed)} className="w-full py-2.5 border border-[#e2d2ac] bg-[#fbf5e9] hover:bg-[#f3e8cf] text-[#2a2018] rounded-lg text-xs cursor-pointer">Reveal Study &amp; Skip</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
