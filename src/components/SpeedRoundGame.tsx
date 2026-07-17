import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ArrowLeft, Clock, Zap } from "lucide-react";
import { WordTerm } from "../data/words";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  isLetter,
  normalizeWord,
  isWordSolved,
  getDepthHint,
  getWordDifficulty,
  getMaxMistakes,
  shuffleArray,
  pickWeightedWord,
  getSpeedComboMultiplier,
  computeSpeedLetterPoints,
  computeSpeedSolveBonus,
  getStreakLabel,
  vibrate,
  SPEED_ROUND_TIME,
  SPEED_SOLVE_BONUS,
  SPEED_SKIP_PENALTY,
  isQuoteRecall,
} from "../utils/gameLogic";
import { rollSpeedEvent, SpeedEvent, DOUBLE_TIME_BONUS, GOLDEN_WORD_SCORE_MULT } from "../utils/rewards";
import type { SpeedRoundResult } from "../hooks/useGameSession";
import type { SpeedBoardMode } from "../utils/speedPools";
import { pickIntroWord, SPEED_INTRO_TIME_SEC } from "../utils/speedIntro";
import PropheticCandles from "./PropheticCandles";
import KeyboardGrid from "./KeyboardGrid";
import WordSlots from "./WordSlots";
import GameFeedback, { FeedbackTone } from "./GameFeedback";
import SoulLamp from "./SoulLamp";
import EllenWhiteAvatar, { AvatarReaction } from "./EllenWhiteAvatar";
import { flashScreen } from "../utils/flash";
import { playRoundEndSound, playSolveSound, playTickSound, stopTickSound } from "../utils/sounds";

interface SpeedRoundGameProps {
  highScore: number;
  highestWordsSolved: number;
  /** Disjoint pool for this board (mixed vs chapter). */
  words: WordTerm[];
  mode: SpeedBoardMode;
  /** UI label e.g. Mixed Pool or chapter title */
  poolLabel: string;
  /** First Mixed/Chapter run: more time, shorter terms, no chaos events. */
  introMode?: boolean;
  candleStyle?: string;
  onGameFinished: (result: SpeedRoundResult) => void;
  onBack: () => void;
}

export default function SpeedRoundGame({
  highScore,
  highestWordsSolved,
  words,
  mode,
  poolLabel,
  introMode = false,
  candleStyle = "classic",
  onGameFinished,
  onBack,
}: SpeedRoundGameProps) {
  const rm = useReducedMotion();
  const roundTime = introMode ? SPEED_INTRO_TIME_SEC : SPEED_ROUND_TIME;
  const [reaction, setReaction] = useState<AvatarReaction>("idle");
  const reactionTimer = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startCountdown, setStartCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(roundTime);
  const [wordsSolved, setWordsSolved] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [wordStreak, setWordStreak] = useState(0);
  const [, setUsedWordIds] = useState<string[]>([]);
  const [currentWordObj, setCurrentWordObj] = useState<WordTerm | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const mistakesAtStartRef = useRef(0);
  const [timeBonusFeedback, setTimeBonusFeedback] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; tone: FeedbackTone } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [speedEvent, setSpeedEvent] = useState<SpeedEvent>("none");
  /** Brief post-solve teach moment: show verse/scripture before next word. */
  const [solvedReveal, setSolvedReveal] = useState<WordTerm | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const solvedRef = useRef(false);
  const finishedRef = useRef(false);
  const gameStartedRef = useRef(false);
  const feedbackTimer = useRef<NodeJS.Timeout | null>(null);
  const eventMultRef = useRef(1);
  const speedEventRef = useRef<SpeedEvent>("none");
  speedEventRef.current = speedEvent;

  const difficulty = currentWordObj ? getWordDifficulty(currentWordObj) : "medium";
  const maxMistakes = getMaxMistakes(difficulty);
  const allWordsList = useMemo(() => words, [words]);

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
    setUsedWordIds((prevUsed) => {
      let available = allWordsList.filter((w) => !prevUsed.includes(w.id));
      let nextUsed = prevUsed;
      if (available.length === 0) {
        available = shuffleArray(allWordsList);
        nextUsed = [];
      }
      const selected = introMode
        ? pickIntroWord(available, allWordsList)
        : pickWeightedWord(available, allWordsList);
      // Intro: no golden/double-time chaos — let new players learn the loop first.
      const evt: SpeedEvent = introMode ? "none" : rollSpeedEvent();
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
      setGuessedLetters([]);
      setMistakes(0);
      mistakesAtStartRef.current = 0;
      solvedRef.current = false;
      return [...nextUsed, selected.id];
    });
  }, [allWordsList, introMode]);

  const loadNextWordRef = useRef(loadNextWord);
  loadNextWordRef.current = loadNextWord;

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

  // Pause the clock while the player reads the post-solve scripture card.
  // Each second: decrement + one tick SFX (aligned to this interval, not free-running audio).
  useEffect(() => {
    if (!isPlaying || isGameOver || solvedReveal) {
      stopTickSound();
      return;
    }
    timerRef.current = setInterval(() => {
      playTickSound();
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          if (timerRef.current) clearInterval(timerRef.current);
          stopTickSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopTickSound();
    };
  }, [isPlaying, isGameOver, solvedReveal]);

  const wordText = currentWordObj ? normalizeWord(currentWordObj.word) : "";
  const solved = currentWordObj ? isWordSolved(wordText, guessedLetters) : false;
  const depthHint = currentWordObj ? getDepthHint(currentWordObj, mistakes, difficulty) : null;
  const quoteRecall = currentWordObj ? isQuoteRecall(currentWordObj) : false;
  const comboMult = getSpeedComboMultiplier(wordStreak);
  const reviewingScripture = Boolean(solvedReveal);

  const makeGuess = useCallback(
    (letter: string) => {
      if (!isPlaying || isGameOver || !currentWordObj || reviewingScripture) return;
      const upper = letter.toUpperCase();
      if (!isLetter(upper) || guessedLetters.includes(upper)) return;

      setGuessedLetters((prev) => [...prev, upper]);
      if (wordText.includes(upper)) {
        setScore((p) => p + computeSpeedLetterPoints(wordStreak, eventMultRef.current));
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
            const penaltyEndsRound = timeLeft <= SPEED_SKIP_PENALTY;
            setTimeLeft((t) => Math.max(0, t - SPEED_SKIP_PENALTY));
            setTimeBonusFeedback(`-${SPEED_SKIP_PENALTY}s Skip!`);
            setTimeout(() => setTimeBonusFeedback(null), 1200);
            if (penaltyEndsRound) {
              setIsGameOver(true);
              if (timerRef.current) clearInterval(timerRef.current);
            } else {
              setTimeout(() => loadNextWord(), 500);
            }
          }
          vibrate([80, 50, 80]);
          return next;
        });
      }
    },
    [isPlaying, isGameOver, currentWordObj, guessedLetters, wordText, loadNextWord, maxMistakes, comboMult, flashReaction, timeLeft, reviewingScripture]
  );

  // Credit a full solve once, then wait for manual Continue after scripture.
  useEffect(() => {
    if (!solved || !currentWordObj || solvedRef.current) return;
    solvedRef.current = true;
    playSolveSound();

    const evt = speedEventRef.current;
    const multAtSolve = eventMultRef.current;
    setWordStreak((prevStreak) => {
      const nextStreak = prevStreak + 1;
      const mult = getSpeedComboMultiplier(nextStreak);
      setWordsSolved((p) => p + 1);
      setMistakes((m) => {
        // Perfect = no wrong letters this word (0 mistakes when solved).
        if (m === 0) {
          setPerfectCount((pc) => pc + 1);
          showFeedback("+25 XP Perfect!", "success");
        }
        const solveBonus = computeSpeedSolveBonus(m, maxMistakes, nextStreak, multAtSolve);
        setScore((p) => p + solveBonus);
        return m;
      });
      setTimeLeft((p) => p + SPEED_SOLVE_BONUS);
      const label = getStreakLabel(nextStreak);
      const golden = evt === "golden-word" ? " ★GOLDEN" : "";
      setTimeBonusFeedback(label ? `${label} +${SPEED_SOLVE_BONUS}s${golden}` : `+${SPEED_SOLVE_BONUS}s ×${mult}${golden}!`);
      if (label) showFeedback(label, "combo");
      return nextStreak;
    });
    eventMultRef.current = 1;
    setSpeedEvent("none");
    setSolvedReveal(currentWordObj);

    const fb = window.setTimeout(() => setTimeBonusFeedback(null), 1200);
    return () => {
      window.clearTimeout(fb);
    };
  }, [solved, currentWordObj, maxMistakes, showFeedback]);

  const continueAfterScripture = useCallback(() => {
    if (!solvedReveal) return;
    setSolvedReveal(null);
    loadNextWordRef.current();
  }, [solvedReveal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver || showConfirmExit) return;
      // Enter / Space advances after reading scripture
      if (reviewingScripture && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        continueAfterScripture();
        return;
      }
      if (reviewingScripture) return;
      const key = e.key.toUpperCase();
      if (isLetter(key) && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) makeGuess(key);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isGameOver, makeGuess, showConfirmExit, reviewingScripture, continueAfterScripture]);

  // Sound only when the round ends — progress/XP wait for manual Continue.
  useEffect(() => {
    if (isGameOver) {
      playRoundEndSound();
    }
  }, [isGameOver]);

  /** Commit XP (and board progress) once, after the player has seen the score. */
  const commitRoundResult = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onGameFinished({
      finalScore: score,
      wordsSolved,
      perfectCount,
      mode,
      wasIntro: introMode,
    });
  }, [score, wordsSolved, perfectCount, mode, introMode, onGameFinished]);

  const handleContinue = useCallback(() => {
    commitRoundResult();
    onBack();
  }, [commitRoundResult, onBack]);

  const handleRestart = () => {
    commitRoundResult();
    finishedRef.current = false;
    gameStartedRef.current = false;
    setScore(0);
    setTimeLeft(roundTime);
    setWordsSolved(0);
    setPerfectCount(0);
    setWordStreak(0);
    setUsedWordIds([]);
    setCurrentWordObj(null);
    setGuessedLetters([]);
    setMistakes(0);
    setIsGameOver(false);
    setSolvedReveal(null);
    setStartCountdown(3);
    setIsPlaying(false);
    solvedRef.current = false;
  };

  if (allWordsList.length === 0) {
    return (
      <div className="max-w-md mx-auto py-8 px-4 text-center space-y-4">
        <p className="text-sm text-[#c9c2b4]">No words in this speed pool.</p>
        <button
          type="button"
          onClick={onBack}
          className="py-2.5 px-5 bg-[#101014] text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          Back to menu
        </button>
      </div>
    );
  }

  if (startCountdown > 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
        <span className="text-sm font-bold tracking-[0.2em] text-[#a49b8d] uppercase">
          {introMode ? "Practice round" : mode === "mixed" ? "Mixed Speed" : "Chapter Speed"} ·{" "}
          {poolLabel}
        </span>
        <h2 className="text-xl font-display font-bold text-[#f4f1ea] max-w-sm tracking-wide leading-relaxed">
          {roundTime}s · +time on solves · perfect word = +25 XP · pool: {allWordsList.length} terms
          {introMode ? " · shorter words" : ""}
        </h2>
        <motion.div key={startCountdown} initial={rm ? false : { scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-28 h-28 rounded-full psunken flex items-center justify-center text-4xl font-extrabold font-mono text-[#f4f1ea]">
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

      <div className="grid grid-cols-3 gap-2 pb-3 border-b border-white/10 items-center">
        <button
          type="button"
          onClick={() => {
            if (isGameOver) {
              handleContinue();
              return;
            }
            if (isPlaying) {
              setShowConfirmExit(true);
              return;
            }
            onBack();
          }}
          className="flex items-center gap-1 text-xs text-[#c9c2b4] hover:text-[#f4f1ea] py-1 px-2.5 hover:bg-white/10 rounded-lg cursor-pointer justify-self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Quit
        </button>
        <div className={`flex items-center gap-1.5 justify-center px-3 py-1.5 rounded-lg border max-w-[130px] mx-auto transition-colors ${
          timeLeft <= 10 ? "bg-rose-500/10 border-rose-300 danger-pulse" : "pcard"
        }`}>
          <Clock className={`w-4 h-4 ${timeLeft <= 10 ? "text-rose-700 animate-pulse" : "text-[#a49b8d]"}`} aria-hidden="true" />
          <span className={`font-mono text-sm font-extrabold ${timeLeft <= 10 ? "text-rose-700" : "text-[#f4f1ea]"}`}>
            0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </span>
        </div>
        <div className="text-right justify-self-end">
          <div className="text-[10px] text-[#a49b8d] uppercase font-bold">Score</div>
          <div className="text-lg font-extrabold font-mono text-[#f4f1ea]">{score}</div>
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

      {introMode && (
        <div className="text-center text-[11px] font-semibold text-[#fbbf24] bg-[#f5b301]/10 border border-[#f5b301]/30 rounded-xl px-3 py-2">
          Practice round — {roundTime}s, shorter terms, no golden events. Next run is full speed.
        </div>
      )}

      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-[#a49b8d] psunken py-1.5 px-3 rounded-lg">
        <span>Solved: <strong className="font-mono text-[#f4f1ea]">{wordsSolved}</strong></span>
        {wordStreak >= 2 && (
          <span className="flex items-center gap-1 text-violet-700">
            <Zap className="w-3 h-3" aria-hidden="true" /> Combo ×{comboMult}
          </span>
        )}
        <span>Mistakes: <strong className="font-mono text-[#f4f1ea]">{mistakes}/{maxMistakes}</strong></span>
      </div>

      {currentWordObj && (
        <motion.div key={currentWordObj.id} initial={rm ? false : { opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="pcard rounded-2xl p-5 text-center space-y-2 parchment-glow">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-[9px] uppercase font-bold text-[#a49b8d]">{poolLabel}</span>
            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
              mode === "mixed" ? "bg-blue-50 text-blue-800" : "bg-[#f5b301]/10 text-[#fbbf24]"
            }`}>{mode === "mixed" ? "Mixed board" : "Chapter board"}</span>
            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
              difficulty === "hard" ? "bg-rose-500/10 text-rose-800" : difficulty === "medium" ? "bg-amber-100 text-[#fbbf24]" : "bg-emerald-500/10 text-emerald-800"
            }`}>{difficulty}</span>
            {quoteRecall && (
              <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-[#f5b301]/15 text-[#fbbf24] border border-[#f5b301]/30">
                Complete the verse
              </span>
            )}
          </div>
          <p className="text-[10px] uppercase font-bold tracking-[0.15em] text-[#a49b8d]">Clue</p>
          <p className="text-lg sm:text-xl font-light leading-relaxed text-[#f4f1ea]">"{currentWordObj.clue}"</p>
          {quoteRecall && (
            <p className="text-[11px] font-semibold text-[#a49b8d]">— {currentWordObj.verse}</p>
          )}
          {depthHint && !solvedReveal && (
            <p className="text-xs text-[#fbbf24] bg-[#f5b301]/10 border border-[#f5b301]/30 rounded px-3 py-2">{depthHint}</p>
          )}
          {solvedReveal && solvedReveal.id === currentWordObj.id && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 pt-3 border-t border-white/10 space-y-3"
            >
              <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">
                Solved — read the Scripture
              </p>
              <p className="text-sm font-semibold text-[#f4f1ea] font-mono tracking-wide">
                {solvedReveal.word}
              </p>
              <p className="text-xs sm:text-sm font-scripture italic text-[#c9c2b4] leading-relaxed">
                "{solvedReveal.scripture}"
              </p>
              <p className="text-[11px] text-[#a49b8d] font-semibold">— {solvedReveal.verse}</p>
              <p className="text-[10px] text-[#a49b8d]">
                Timer paused · press Continue or Enter when ready
              </p>
              <button
                type="button"
                onClick={continueAfterScripture}
                className="w-full sm:w-auto mx-auto block py-2.5 px-6 bg-[#101014] hover:bg-black text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Continue
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      <PropheticCandles mistakes={mistakes} maxMistakes={maxMistakes} compact style={candleStyle} />

      {currentWordObj && (
        <WordSlots wordText={wordText} guessedLetters={guessedLetters} mistakes={mistakes} maxMistakes={maxMistakes} size="compact" revealOnFailure={false} />
      )}

      {currentWordObj && !reviewingScripture && (
        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-end justify-center max-w-3xl mx-auto">
          {isPlaying && !isGameOver && (
            <div className="shrink-0 pointer-events-none order-2 sm:order-1">
              <SoulLamp fuel={timeLeft / roundTime} seconds={timeLeft} size={96} />
            </div>
          )}
          <div className="w-full sm:flex-1 min-w-0 order-1 sm:order-2">
            <KeyboardGrid
              guessedLetters={guessedLetters}
              wordText={wordText}
              onGuess={makeGuess}
              disabled={mistakes >= maxMistakes || solved || !isPlaying || reviewingScripture}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="pcard rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
              <h4 className="font-display font-bold text-[#f4f1ea]">Exit Speed Round?</h4>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmExit(false)} className="flex-1 py-2 border border-white/10 bg-white/[0.06] hover:bg-white/10 text-[#f4f1ea] rounded-lg text-xs cursor-pointer">Resume</button>
                <button onClick={onBack} className="flex-1 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs cursor-pointer">Exit</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div initial={rm ? false : { scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }}
              className="pcard rounded-2xl p-8 max-w-md w-full text-center space-y-6">
              <Clock className="w-10 h-10 mx-auto text-[#f5b301]" aria-hidden="true" />
              <h3 className="text-xl font-display font-bold text-[#f4f1ea]">Time's Up!</h3>
              <p className="text-xs text-[#a49b8d]">Your run score — review it, then continue to bank XP.</p>
              <div className="grid grid-cols-2 gap-4 psunken p-4 rounded-xl">
                <div><div className="text-2xl font-mono font-bold text-[#f4f1ea]">{score}</div><div className="text-[10px] text-[#a49b8d] uppercase">Score</div></div>
                <div><div className="text-2xl font-mono font-bold text-[#f4f1ea]">{wordsSolved}</div><div className="text-[10px] text-[#a49b8d] uppercase">Solved</div></div>
                <div className="col-span-2 text-xs text-[#a49b8d]">
                  Perfect (0 miss): <strong className="text-[#f4f1ea] font-mono">{perfectCount}</strong>
                  {" · "}+{perfectCount * 25} XP · board: {mode}
                </div>
              </div>
              {score > highScore ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg text-emerald-800 text-sm font-bold">🏆 New High Score!</div>
              ) : nearMiss ? (
                <div className="bg-[#f5b301]/10 border border-[#f5b301]/30 p-2.5 rounded-lg text-[#fbbf24] text-xs font-bold">{nearMiss}</div>
              ) : (
                <div className="text-[11px] text-[#a49b8d]">Your best: {highScore} pts · {highestWordsSolved} words</div>
              )}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="w-full py-3 bg-[#101014] hover:bg-black text-[#f8f1e3] rounded-lg text-sm font-bold uppercase tracking-wider cursor-pointer"
                >
                  Continue · bank XP
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="w-full py-2 border border-white/10 bg-white/[0.06] hover:bg-white/10 text-[#f4f1ea] rounded-lg text-xs cursor-pointer"
                >
                  ↻ Rematch
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
