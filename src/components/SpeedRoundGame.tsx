import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Clock, Zap } from "lucide-react";
import { WordTerm, allWordsList } from "../data/words";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  MAX_MISTAKES,
  isLetter,
  normalizeWord,
  isWordSolved,
  getDepthHint,
  getChapterForWord,
  getWordDifficulty,
  getMaxMistakes,
  shuffleArray,
  pickWeightedWord,
  getSpeedComboMultiplier,
  getStreakLabel,
  vibrate,
  SPEED_ROUND_TIME,
  SPEED_SOLVE_BONUS,
  SPEED_SKIP_PENALTY,
} from "../utils/gameLogic";
import { rollSpeedEvent, SpeedEvent, DOUBLE_TIME_BONUS, GOLDEN_WORD_SCORE_MULT } from "../utils/rewards";
import PropheticCandles from "./PropheticCandles";
import KeyboardGrid from "./KeyboardGrid";
import WordSlots from "./WordSlots";
import GameFeedback, { FeedbackTone } from "./GameFeedback";
import SoulLamp from "./SoulLamp";
import EllenWhiteAvatar, { AvatarReaction } from "./EllenWhiteAvatar";
import { flashScreen } from "../utils/flash";

interface SpeedRoundGameProps {
  highScore: number;
  highestWordsSolved: number;
  onGameFinished: (finalScore: number, wordsCount: number) => void;
  onBack: () => void;
}

export default function SpeedRoundGame({ highScore, highestWordsSolved, onGameFinished, onBack }: SpeedRoundGameProps) {
  const rm = useReducedMotion();
  const [reaction, setReaction] = useState<AvatarReaction>("idle");
  const reactionTimer = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startCountdown, setStartCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SPEED_ROUND_TIME);
  const [wordsSolved, setWordsSolved] = useState(0);
  const [wordStreak, setWordStreak] = useState(0);
  const [usedWordIds, setUsedWordIds] = useState<string[]>([]);
  const [currentWordObj, setCurrentWordObj] = useState<WordTerm | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [timeBonusFeedback, setTimeBonusFeedback] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; tone: FeedbackTone } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [speedEvent, setSpeedEvent] = useState<SpeedEvent>("none");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const solvedRef = useRef(false);
  const finishedRef = useRef(false);
  const gameStartedRef = useRef(false);
  const feedbackTimer = useRef<NodeJS.Timeout | null>(null);
  const eventMultRef = useRef(1);

  const difficulty = currentWordObj ? getWordDifficulty(currentWordObj) : "medium";
  const maxMistakes = getMaxMistakes(difficulty);

  const showFeedback = useCallback((text: string, tone: FeedbackTone) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback({ text, tone });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 1400);
  }, []);

  const flashReaction = useCallback((r: AvatarReaction) => {
    setReaction(r);
    if (reactionTimer.current) clearTimeout(reactionTimer.current);
    reactionTimer.current = setTimeout(() => setReaction("idle"), 1400);
  }, []);

  const loadNextWord = useCallback(() => {
    let available = allWordsList.filter((w) => !usedWordIds.includes(w.id));
    if (available.length === 0) {
      available = shuffleArray(allWordsList);
      setUsedWordIds([]);
    }
    const selected = pickWeightedWord(available);
    const evt = rollSpeedEvent();
    setSpeedEvent(evt);
    eventMultRef.current = evt === "golden-word" ? GOLDEN_WORD_SCORE_MULT : 1;
    if (evt === "double-time") {
      setTimeLeft((t) => t + DOUBLE_TIME_BONUS);
      setTimeBonusFeedback(`Double Time +${DOUBLE_TIME_BONUS}s!`);
      setTimeout(() => setTimeBonusFeedback(null), 1400);
    } else if (evt === "golden-word") {
      setTimeBonusFeedback("Golden Word ×2!");
      setTimeout(() => setTimeBonusFeedback(null), 1400);
    }
    setCurrentWordObj(selected);
    setUsedWordIds((prev) => [...prev, selected.id]);
    setGuessedLetters([]);
    setMistakes(0);
    solvedRef.current = false;
  }, [usedWordIds]);

  useEffect(() => {
    if (startCountdown > 0) {
      const timer = setTimeout(() => setStartCountdown((p) => p - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (!gameStartedRef.current) {
      gameStartedRef.current = true;
      setIsPlaying(true);
      loadNextWord();
    }
  }, [startCountdown, loadNextWord]);

  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, isGameOver]);

  const wordText = currentWordObj ? normalizeWord(currentWordObj.word) : "";
  const solved = currentWordObj ? isWordSolved(wordText, guessedLetters) : false;
  const depthHint = currentWordObj ? getDepthHint(currentWordObj, mistakes, difficulty) : null;
  const chapter = currentWordObj ? getChapterForWord(currentWordObj.id) : undefined;
  const comboMult = getSpeedComboMultiplier(wordStreak);

  const makeGuess = useCallback(
    (letter: string) => {
      if (!isPlaying || isGameOver || !currentWordObj) return;
      const upper = letter.toUpperCase();
      if (!isLetter(upper) || guessedLetters.includes(upper)) return;

      setGuessedLetters((prev) => [...prev, upper]);
      if (wordText.includes(upper)) {
        setScore((p) => p + Math.round(100 * comboMult * eventMultRef.current));
        vibrate(40);
        flashScreen(true);
        flashReaction("correct");
      } else {
        flashScreen(false);
        flashReaction("incorrect");
        setMistakes((prev) => {
          const next = prev + 1;
          if (next >= maxMistakes) {
            setWordStreak(0);
            setTimeLeft((t) => Math.max(0, t - SPEED_SKIP_PENALTY));
            setTimeBonusFeedback(`-${SPEED_SKIP_PENALTY}s Skip!`);
            setTimeout(() => setTimeBonusFeedback(null), 1200);
            setTimeout(() => loadNextWord(), 500);
          }
          vibrate([80, 50, 80]);
          return next;
        });
      }
    },
    [isPlaying, isGameOver, currentWordObj, guessedLetters, wordText, loadNextWord, maxMistakes, comboMult, flashReaction]
  );

  useEffect(() => {
    if (solved && currentWordObj && !solvedRef.current) {
      solvedRef.current = true;
      const nextStreak = wordStreak + 1;
      const mult = getSpeedComboMultiplier(nextStreak);
      setWordStreak(nextStreak);
      setWordsSolved((p) => p + 1);
      const solveBonus = Math.round((1000 + (maxMistakes - mistakes) * 200) * mult * eventMultRef.current);
      setScore((p) => p + solveBonus);
      setTimeLeft((p) => p + SPEED_SOLVE_BONUS);
      const label = getStreakLabel(nextStreak);
      const golden = speedEvent === "golden-word" ? " ★GOLDEN" : "";
      setTimeBonusFeedback(label ? `${label} +${SPEED_SOLVE_BONUS}s${golden}` : `+${SPEED_SOLVE_BONUS}s ×${mult}${golden}!`);
      if (label) showFeedback(label, "combo");
      eventMultRef.current = 1;
      setSpeedEvent("none");
      const fb = setTimeout(() => setTimeBonusFeedback(null), 1200);
      const next = setTimeout(() => loadNextWord(), 700);
      return () => { clearTimeout(fb); clearTimeout(next); };
    }
  }, [solved, currentWordObj, mistakes, loadNextWord, wordStreak, maxMistakes, showFeedback, speedEvent]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver || showConfirmExit) return;
      const key = e.key.toUpperCase();
      if (isLetter(key) && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) makeGuess(key);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isGameOver, makeGuess, showConfirmExit]);

  useEffect(() => {
    if (isGameOver && !finishedRef.current) {
      finishedRef.current = true;
      onGameFinished(score, wordsSolved);
    }
  }, [isGameOver, score, wordsSolved, onGameFinished]);

  const handleRestart = () => {
    finishedRef.current = false;
    gameStartedRef.current = false;
    setScore(0);
    setTimeLeft(SPEED_ROUND_TIME);
    setWordsSolved(0);
    setWordStreak(0);
    setUsedWordIds([]);
    setCurrentWordObj(null);
    setGuessedLetters([]);
    setMistakes(0);
    setIsGameOver(false);
    setStartCountdown(3);
    setIsPlaying(false);
    solvedRef.current = false;
  };

  if (startCountdown > 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
        <span className="text-sm font-bold tracking-[0.2em] text-[#6b5537] uppercase">Prophetic Speed Challenge</span>
        <h2 className="text-xl font-display font-bold text-[#2a2018] max-w-sm tracking-wide leading-relaxed">{SPEED_ROUND_TIME}s on the clock. Solves +{SPEED_SOLVE_BONUS}s. Skips -{SPEED_SKIP_PENALTY}s. Build combos!</h2>
        <motion.div key={startCountdown} initial={rm ? false : { scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-28 h-28 rounded-full psunken flex items-center justify-center text-4xl font-extrabold font-mono text-[#2a2018]">
          {startCountdown}
        </motion.div>
      </div>
    );
  }

  const beatWords = wordsSolved > highestWordsSolved;
  const wordsShort = highestWordsSolved - wordsSolved;
  const scoreShort = highScore - score;
  const nearMiss =
    !beatWords && highestWordsSolved > 0 && wordsShort >= 1 && wordsShort <= 2
      ? `So close — ${wordsShort} word${wordsShort > 1 ? "s" : ""} from your best of ${highestWordsSolved}!`
      : score <= highScore && highScore > 0 && scoreShort > 0 && scoreShort <= Math.max(300, Math.round(highScore * 0.1))
      ? `Just ${scoreShort} points short of your record — one more run?`
      : null;

  return (
    <div className="space-y-5 max-w-4xl mx-auto py-2 px-2 select-none relative">
      <GameFeedback text={feedback?.text ?? null} tone={feedback?.tone} />

      <div className="grid grid-cols-3 gap-2 pb-3 border-b border-[#e2d2ac] items-center">
        <button onClick={() => isPlaying && !isGameOver ? setShowConfirmExit(true) : onBack()}
          className="flex items-center gap-1 text-xs text-[#5c4a33] hover:text-[#2a2018] py-1 px-2.5 hover:bg-[#f0e3c8] rounded-lg cursor-pointer justify-self-start">
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Quit
        </button>
        <div className={`flex items-center gap-1.5 justify-center px-3 py-1.5 rounded-lg border max-w-[130px] mx-auto transition-colors ${
          timeLeft <= 10 ? "bg-rose-50 border-rose-300 danger-pulse" : "pcard"
        }`}>
          <Clock className={`w-4 h-4 ${timeLeft <= 10 ? "text-rose-700 animate-pulse" : "text-[#6b5537]"}`} aria-hidden="true" />
          <span className={`font-mono text-sm font-extrabold ${timeLeft <= 10 ? "text-rose-700" : "text-[#2a2018]"}`}>
            0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </span>
        </div>
        <div className="text-right justify-self-end">
          <div className="text-[10px] text-[#6b5537] uppercase font-bold">Score</div>
          <div className="text-lg font-extrabold font-mono text-[#2a2018]">{score}</div>
        </div>
      </div>

      <AnimatePresence>
        {timeBonusFeedback && (
          <motion.div initial={rm ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={rm ? { opacity: 1 } : { opacity: 1, y: -25 }} exit={{ opacity: 0, y: -45 }}
            className={`absolute top-16 left-1/2 -translate-x-1/2 font-bold px-4 py-2 rounded-full text-sm z-30 shadow-lg ${
              timeBonusFeedback.includes("-") ? "bg-rose-700 text-white" : "bg-emerald-700 text-white"
            }`}>{timeBonusFeedback}</motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-[#6b5537] psunken py-1.5 px-3 rounded-lg">
        <span>Solved: <strong className="font-mono text-[#2a2018]">{wordsSolved}</strong></span>
        {wordStreak >= 2 && (
          <span className="flex items-center gap-1 text-violet-700">
            <Zap className="w-3 h-3" aria-hidden="true" /> Combo ×{comboMult}
          </span>
        )}
        <span>Mistakes: <strong className="font-mono text-[#2a2018]">{mistakes}/{maxMistakes}</strong></span>
      </div>

      {currentWordObj && (
        <motion.div key={currentWordObj.id} initial={rm ? false : { opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="pcard rounded-2xl p-5 text-center space-y-2 parchment-glow">
          <div className="flex items-center justify-center gap-2">
            {chapter && <span className="text-[9px] uppercase font-bold text-[#6b5537]">{chapter.title}</span>}
            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
              difficulty === "hard" ? "bg-rose-50 text-rose-800" : difficulty === "medium" ? "bg-amber-100 text-[#92400e]" : "bg-emerald-50 text-emerald-800"
            }`}>{difficulty}</span>
          </div>
          <p className="text-lg sm:text-xl font-light leading-relaxed text-[#2a2018]">"{currentWordObj.clue}"</p>
          {depthHint && <p className="text-xs text-[#92400e] bg-[#fbeccb] border border-[#e6c98a] rounded px-3 py-2">{depthHint}</p>}
        </motion.div>
      )}

      <PropheticCandles mistakes={mistakes} maxMistakes={maxMistakes} compact />

      {currentWordObj && (
        <WordSlots wordText={wordText} guessedLetters={guessedLetters} mistakes={mistakes} maxMistakes={maxMistakes} size="compact" revealOnFailure={false} />
      )}

      {currentWordObj && (
        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-end justify-center max-w-3xl mx-auto">
          {isPlaying && !isGameOver && (
            <div className="shrink-0 pointer-events-none order-2 sm:order-1">
              <SoulLamp fuel={timeLeft / SPEED_ROUND_TIME} seconds={timeLeft} size={96} />
            </div>
          )}
          <div className="w-full sm:flex-1 min-w-0 order-1 sm:order-2">
            <KeyboardGrid
              guessedLetters={guessedLetters}
              wordText={wordText}
              onGuess={makeGuess}
              disabled={mistakes >= maxMistakes || solved || !isPlaying}
            />
          </div>
          {isPlaying && !isGameOver && (
            <div className="shrink-0 pointer-events-none order-3 ml-auto sm:ml-0">
              <EllenWhiteAvatar reaction={reaction} size={112} />
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showConfirmExit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-[#2a2018]/55 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="pcard rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
              <h4 className="font-display font-bold text-[#2a2018]">Exit Speed Round?</h4>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmExit(false)} className="flex-1 py-2 border border-[#e2d2ac] bg-[#fbf5e9] hover:bg-[#f3e8cf] text-[#2a2018] rounded-lg text-xs cursor-pointer">Resume</button>
                <button onClick={onBack} className="flex-1 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs cursor-pointer">Exit</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-[#2a2018]/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div initial={rm ? false : { scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }}
              className="pcard rounded-2xl p-8 max-w-md w-full text-center space-y-6">
              <Clock className="w-10 h-10 mx-auto text-[#b45309]" aria-hidden="true" />
              <h3 className="text-xl font-display font-bold text-[#2a2018]">Time's Up!</h3>
              <div className="grid grid-cols-2 gap-4 psunken p-4 rounded-xl">
                <div><div className="text-2xl font-mono font-bold text-[#2a2018]">{score}</div><div className="text-[10px] text-[#6b5537] uppercase">Score</div></div>
                <div><div className="text-2xl font-mono font-bold text-[#2a2018]">{wordsSolved}</div><div className="text-[10px] text-[#6b5537] uppercase">Solved</div></div>
              </div>
              {score > highScore ? (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-800 text-sm font-bold">🏆 New High Score!</div>
              ) : nearMiss ? (
                <div className="bg-[#fbeccb] border border-[#e6c98a] p-2.5 rounded-lg text-[#92400e] text-xs font-bold">{nearMiss}</div>
              ) : (
                <div className="text-[11px] text-[#6b5537]">Your best: {highScore} pts · {highestWordsSolved} words</div>
              )}
              <div className="flex flex-col gap-2">
                <button onClick={handleRestart} className="w-full py-3 bg-[#2a2018] hover:bg-[#1c140d] text-[#f8f1e3] rounded-lg text-sm font-bold uppercase tracking-wider cursor-pointer">↻ Rematch</button>
                <button onClick={onBack} className="w-full py-2 border border-[#e2d2ac] bg-[#fbf5e9] hover:bg-[#f3e8cf] text-[#2a2018] rounded-lg text-xs cursor-pointer">Back to Menu</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
