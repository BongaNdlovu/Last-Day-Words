import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Lightbulb, RefreshCw, Eye, Trophy, Users, Zap } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import confetti from "canvas-confetti";
import {
  isLetter,
  normalizeWord,
  isWordSolved,
  buildTeamsRound,
  calcTeamPoints,
  getChapterForWord,
  getWordDifficulty,
  getMaxMistakes,
  getDepthHint,
  pickRandomHintLetter,
  getStreakLabel,
  vibrate,
  TEAMS_QUESTIONS_PER_SIDE,
  MAX_HINTS_PER_WORD,
  HINT_MISTAKE_PENALTY,
  TeamId,
} from "../utils/gameLogic";
import PropheticCandles from "./PropheticCandles";
import KeyboardGrid from "./KeyboardGrid";
import WordSlots from "./WordSlots";
import GameFeedback, { FeedbackTone } from "./GameFeedback";
import { flashScreen } from "../utils/flash";

interface TeamsModeGameProps {
  onBack: () => void;
}

type Phase = "intro" | "playing" | "turn-result" | "finished";

export default function TeamsModeGame({ onBack }: TeamsModeGameProps) {
  const rm = useReducedMotion();
  const [roundWords, setRoundWords] = useState(() => buildTeamsRound());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [scores, setScores] = useState({ white: 0, black: 0 });
  const [lastTurnPoints, setLastTurnPoints] = useState(0);
  const [letterStreak, setLetterStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; tone: FeedbackTone } | null>(null);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const solvedRef = useRef(false);
  const feedbackTimer = useRef<NodeJS.Timeout | null>(null);

  const currentWord = roundWords[questionIndex];
  const wordText = normalizeWord(currentWord.word);
  const activeTeam: TeamId = questionIndex % 2 === 0 ? "white" : "black";
  const roundNumber = Math.floor(questionIndex / 2) + 1;
  const chapter = getChapterForWord(currentWord.id);
  const difficulty = getWordDifficulty(currentWord);
  const maxMistakes = getMaxMistakes(difficulty);
  const depthHint = getDepthHint(currentWord, mistakes, difficulty);
  const solved = isWordSolved(wordText, guessedLetters);
  const streakLabel = getStreakLabel(letterStreak);

  const showFeedback = useCallback((text: string, tone: FeedbackTone) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback({ text, tone });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 1400);
  }, []);

  const resetTurn = useCallback(() => {
    setGuessedLetters([]);
    setMistakes(0);
    setHintsUsed(0);
    setLetterStreak(0);
    setFeedback(null);
    solvedRef.current = false;
  }, []);

  const finishTurn = useCallback(
    (wasSolved: boolean) => {
      const pts = calcTeamPoints(mistakes, hintsUsed, wasSolved, letterStreak);
      setLastTurnPoints(pts);
      setScores((prev) => ({
        ...prev,
        [activeTeam]: prev[activeTeam] + pts,
      }));
      setPhase("turn-result");
    },
    [mistakes, hintsUsed, activeTeam, letterStreak]
  );

  const advanceQuestion = useCallback(() => {
    if (questionIndex >= roundWords.length - 1) {
      setPhase("finished");
      return;
    }
    setQuestionIndex((i) => i + 1);
    resetTurn();
    setPhase("playing");
  }, [questionIndex, roundWords.length, resetTurn]);

  useEffect(() => {
    if (phase !== "finished") return;
    const winner = scores.white > scores.black ? "white" : scores.black > scores.white ? "black" : "tie";
    if (winner !== "tie") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: winner === "white" ? ["#F8FAFC", "#E2E8F0", "#F59E0B"] : ["#1A1A1B", "#475569", "#F59E0B"],
      });
    }
  }, [phase, scores]);

  const makeGuess = useCallback(
    (letter: string) => {
      const upper = letter.toUpperCase();
      if (!isLetter(upper) || guessedLetters.includes(upper)) return;
      if (mistakes >= maxMistakes || solved || phase !== "playing") return;

      setGuessedLetters((prev) => [...prev, upper]);
      if (!wordText.includes(upper)) {
        setMistakes((m) => m + 1);
        setLetterStreak(0);
        vibrate([80, 50, 80]);
        flashScreen(false);
      } else {
        setLetterStreak((s) => {
          const next = s + 1;
          const label = getStreakLabel(next);
          if (label) showFeedback(label, "streak");
          return next;
        });
        vibrate(40);
        flashScreen(true);
      }
    },
    [guessedLetters, wordText, mistakes, solved, phase, maxMistakes, showFeedback]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== "playing" || showConfirmExit) return;
      const key = e.key.toUpperCase();
      if (isLetter(key) && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        makeGuess(key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [makeGuess, phase, showConfirmExit]);

  useEffect(() => {
    if (solved && !solvedRef.current && phase === "playing") {
      solvedRef.current = true;
      const timer = setTimeout(() => finishTurn(true), 800);
      return () => clearTimeout(timer);
    }
  }, [solved, phase, finishTurn]);

  useEffect(() => {
    if (mistakes >= maxMistakes && !solved && phase === "playing" && !solvedRef.current) {
      solvedRef.current = true;
      const timer = setTimeout(() => finishTurn(false), 600);
      return () => clearTimeout(timer);
    }
  }, [mistakes, solved, phase, finishTurn, maxMistakes]);

  const handleHint = () => {
    if (solved || mistakes >= maxMistakes || hintsUsed >= MAX_HINTS_PER_WORD || phase !== "playing") return;
    const letter = pickRandomHintLetter(wordText, guessedLetters);
    if (letter) {
      setGuessedLetters((prev) => [...prev, letter]);
      setHintsUsed((h) => h + 1);
      setMistakes((m) => Math.min(maxMistakes, m + HINT_MISTAKE_PENALTY));
      setLetterStreak(0);
      showFeedback("Hint costs a lamp!", "danger");
    }
  };

  if (phase === "intro") {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 psunken rounded-full text-xs font-bold uppercase tracking-wider text-[#5c4a33]">
          <Users className="w-4 h-4 text-[#b45309]" aria-hidden="true" /> Teams Mode
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-[#2a2018] tracking-wide">White vs Black</h2>
        <p className="text-[#5c4a33] text-sm leading-relaxed max-w-md mx-auto">
          {TEAMS_QUESTIONS_PER_SIDE} questions per team — harder words, fewer lamps, hints cost a life. Build streaks for bonus points!
        </p>
        <div className="flex justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-[#faf3e4] border-2 border-[#d8c391] shadow-md flex items-center justify-center font-bold text-[#2a2018]">W</div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6b5537]">White Team</span>
          </div>
          <div className="text-2xl font-light text-[#b09468] self-center">vs</div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-[#2a2018] border-2 border-[#4a3826] shadow-md flex items-center justify-center font-bold text-[#f8f1e3]">B</div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6b5537]">Black Team</span>
          </div>
        </div>
        <button
          onClick={() => { resetTurn(); setPhase("playing"); }}
          className="px-8 py-3 bg-[#2a2018] hover:bg-[#1c140d] text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-[0.15em] cursor-pointer parchment-glow"
        >
          Start Match
        </button>
        <button onClick={onBack} className="block mx-auto text-xs text-[#6b5537] hover:text-[#2a2018] cursor-pointer">
          Back to Menu
        </button>
      </div>
    );
  }

  if (phase === "finished") {
    const whiteWins = scores.white > scores.black;
    const blackWins = scores.black > scores.white;
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-8">
        <Trophy className="w-12 h-12 mx-auto text-[#b45309]" aria-hidden="true" />
        <h2 className="text-2xl md:text-3xl font-display font-bold text-[#2a2018] tracking-wide">
          {whiteWins ? "White Team Wins!" : blackWins ? "Black Team Wins!" : "It's a Tie!"}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border ${whiteWins ? "border-[#b45309] bg-[#fbeccb]" : "border-[#e2d2ac] bg-[#fbf5e9]"}`}>
            <div className="text-xs uppercase font-bold text-[#6b5537] mb-1">White</div>
            <div className="text-3xl font-mono font-bold text-[#2a2018]">{scores.white}</div>
          </div>
          <div className={`p-4 rounded-xl border ${blackWins ? "border-[#b45309] bg-[#fbeccb]" : "border-[#e2d2ac] bg-[#fbf5e9]"}`}>
            <div className="text-xs uppercase font-bold text-[#6b5537] mb-1">Black</div>
            <div className="text-3xl font-mono font-bold text-[#2a2018]">{scores.black}</div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={onBack} className="px-6 py-2.5 border border-[#e2d2ac] bg-[#fbf5e9] hover:bg-[#f3e8cf] text-[#2a2018] rounded-lg text-xs font-semibold cursor-pointer">
            Menu
          </button>
          <button
            onClick={() => {
              setRoundWords(buildTeamsRound());
              setQuestionIndex(0);
              setScores({ white: 0, black: 0 });
              resetTurn();
              setPhase("intro");
            }}
            className="px-6 py-2.5 bg-[#2a2018] hover:bg-[#1c140d] text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer"
          >
            Rematch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto py-2 px-2 select-none relative">
      <GameFeedback text={feedback?.text ?? null} tone={feedback?.tone} />
      <div className="flex items-center justify-between pb-3 border-b border-[#e2d2ac]">
        <button
          onClick={() => setShowConfirmExit(true)}
          className="flex items-center gap-1.5 text-xs text-[#5c4a33] hover:text-[#2a2018] font-medium py-1.5 px-3 hover:bg-[#f0e3c8] rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Exit
        </button>
        <div className="text-center">
          <div className="text-[10px] text-[#6b5537] font-bold uppercase tracking-[0.15em]">Round {roundNumber} / {TEAMS_QUESTIONS_PER_SIDE}</div>
          <div className="text-xs text-[#5c4a33]">Q{questionIndex + 1} of {roundWords.length}</div>
        </div>
        <div className="flex gap-2 text-xs font-mono font-bold">
          <span className="px-2 py-1 rounded bg-[#faf3e4] border border-[#d8c391] text-[#2a2018]">W {scores.white}</span>
          <span className="px-2 py-1 rounded bg-[#2a2018] text-[#f8f1e3]">B {scores.black}</span>
        </div>
      </div>

      <motion.div
        key={activeTeam}
        initial={rm ? false : { opacity: 0, x: activeTeam === "white" ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`py-3 px-4 rounded-xl text-center font-bold text-sm uppercase tracking-widest ${
          activeTeam === "white"
            ? "bg-[#faf3e4] border-2 border-[#d8c391] text-[#2a2018]"
            : "bg-[#2a2018] text-[#f8f1e3]"
        }`}
      >
        {activeTeam === "white" ? "White Team's Turn" : "Black Team's Turn"}
        {streakLabel && phase === "playing" && (
          <span className="ml-2 inline-flex items-center gap-1 text-[10px] normal-case">
            <Zap className="w-3 h-3" aria-hidden="true" /> {streakLabel}
          </span>
        )}
      </motion.div>

      <AnimatePresence>
        {phase === "turn-result" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#2a2018]/55 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={rm ? false : { scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="pcard rounded-2xl p-6 max-w-sm w-full text-center space-y-4"
            >
              <h3 className="text-lg font-display font-bold capitalize text-[#2a2018]">{activeTeam} Team — {lastTurnPoints > 0 ? `+${lastTurnPoints} pts` : "No points"}</h3>
              <p className="text-sm text-[#5c4a33]">Answer: <strong className="font-mono text-[#2a2018]">{wordText}</strong></p>
              <p className="text-sm font-scripture italic text-[#52412c]">"{currentWord.scripture.slice(0, 100)}…"</p>
              <button
                onClick={advanceQuestion}
                className="w-full py-2.5 bg-[#2a2018] hover:bg-[#1c140d] text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                {questionIndex >= roundWords.length - 1 ? "See Results" : "Next Turn"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmExit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#2a2018]/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="pcard rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
              <h4 className="font-display font-bold text-[#2a2018]">Exit Teams Mode?</h4>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmExit(false)} className="flex-1 py-2 border border-[#e2d2ac] bg-[#fbf5e9] hover:bg-[#f3e8cf] text-[#2a2018] rounded-lg text-xs cursor-pointer">Stay</button>
                <button onClick={onBack} className="flex-1 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs cursor-pointer">Exit</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={rm ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pcard rounded-2xl p-6 text-center space-y-3 parchment-glow">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {chapter && (
            <span className="text-[9px] uppercase tracking-widest font-bold text-[#6b5537] psunken px-2 py-0.5 rounded">{chapter.title}</span>
          )}
          <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${
            difficulty === "easy" ? "bg-emerald-50 text-emerald-800" :
            difficulty === "medium" ? "bg-amber-100 text-[#92400e]" : "bg-rose-50 text-rose-800"
          }`}>{difficulty}</span>
        </div>
        <p className="text-lg md:text-xl font-light text-[#2a2018] leading-relaxed">"{currentWord.clue}"</p>
        <AnimatePresence>
          {depthHint && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }}
              className="text-xs text-[#92400e] bg-[#fbeccb] border border-[#e6c98a] rounded-lg px-3 py-2 leading-relaxed">
              {depthHint}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <PropheticCandles mistakes={mistakes} maxMistakes={maxMistakes} compact />

      {phase === "playing" && (
        <>
          <WordSlots wordText={wordText} guessedLetters={guessedLetters} mistakes={mistakes} maxMistakes={maxMistakes} />
          <div className="flex justify-center gap-3 flex-wrap">
            <button onClick={handleHint} disabled={solved || mistakes >= maxMistakes || hintsUsed >= MAX_HINTS_PER_WORD}
              className="flex items-center gap-1.5 py-2 px-4 bg-[#f0e3c8] hover:bg-[#e8d7b3] disabled:opacity-50 rounded-lg text-xs font-semibold border border-[#e2d2ac] text-[#3a2c1e] cursor-pointer">
              <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" /> Hint ({hintsUsed}/{MAX_HINTS_PER_WORD})
            </button>
            <button onClick={resetTurn}
              className="flex items-center gap-1.5 py-2 px-4 bg-[#fbf5e9] hover:bg-[#f3e8cf] rounded-lg text-xs font-semibold border border-[#e2d2ac] text-[#3a2c1e] cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" /> Reset
            </button>
            <button onClick={() => setMistakes(maxMistakes)} disabled={mistakes >= maxMistakes || solved}
              className="flex items-center gap-1.5 py-2 px-4 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-800 rounded-lg text-xs font-semibold border border-red-200 cursor-pointer">
              <Eye className="w-3.5 h-3.5" aria-hidden="true" /> Reveal
            </button>
          </div>
          <KeyboardGrid guessedLetters={guessedLetters} wordText={wordText} onGuess={makeGuess} disabled={mistakes >= maxMistakes || solved} />
        </>
      )}
    </div>
  );
}
