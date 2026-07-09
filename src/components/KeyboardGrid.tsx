import React from "react";
import { motion } from "motion/react";
import { ALPHABET } from "../utils/gameLogic";

interface KeyboardGridProps {
  guessedLetters: string[];
  wordText: string;
  onGuess: (letter: string) => void;
  disabled: boolean;
}

function KeyButton({
  letter,
  guessedLetters,
  wordText,
  onClick,
  disabled,
}: {
  key?: string;
  letter: string;
  guessedLetters: string[];
  wordText: string;
  onClick: (letter: string) => void;
  disabled: boolean;
}) {
  const upper = wordText.toUpperCase();
  const isGuessed = guessedLetters.includes(letter);
  const isCorrect = isGuessed && upper.includes(letter);

  let btnStyles = "bg-[#fbf5e9] hover:bg-[#2a2018] hover:text-[#f8f1e3] text-[#3a2c1e] border-[#e2d2ac]";
  if (isGuessed) {
    btnStyles = isCorrect
      ? "bg-[#2a2018] text-[#f8f1e3] border-[#2a2018] font-semibold cursor-default hover:bg-[#2a2018]"
      : "bg-[#ece0c6] text-[#a8926a] border-[#e2d2ac] cursor-default line-through hover:bg-[#ece0c6]";
  }

  const stateLabel = isGuessed ? (isCorrect ? ", correct" : ", not in word") : "";

  return (
    <motion.button
      whileTap={!isGuessed && !disabled ? { scale: 0.92 } : undefined}
      onClick={() => !isGuessed && onClick(letter)}
      disabled={disabled || isGuessed}
      aria-label={`Letter ${letter}${stateLabel}`}
      className={`h-10 sm:h-11 rounded-md text-sm font-semibold border flex items-center justify-center transition-colors cursor-pointer ${btnStyles}`}
    >
      {letter}
    </motion.button>
  );
}

export default function KeyboardGrid({ guessedLetters, wordText, onGuess, disabled }: KeyboardGridProps) {
  return (
    <div role="group" aria-label="On-screen keyboard" className="psunken p-4 rounded-xl max-w-2xl mx-auto space-y-2">
      <div className="grid grid-cols-10 gap-1">
        {ALPHABET.slice(0, 10).map((letter) => (
          <KeyButton key={letter} letter={letter} guessedLetters={guessedLetters} wordText={wordText} onClick={onGuess} disabled={disabled} />
        ))}
      </div>
      <div className="grid grid-cols-9 gap-1 max-w-[90%] mx-auto">
        {ALPHABET.slice(10, 19).map((letter) => (
          <KeyButton key={letter} letter={letter} guessedLetters={guessedLetters} wordText={wordText} onClick={onGuess} disabled={disabled} />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 max-w-[70%] mx-auto">
        {ALPHABET.slice(19).map((letter) => (
          <KeyButton key={letter} letter={letter} guessedLetters={guessedLetters} wordText={wordText} onClick={onGuess} disabled={disabled} />
        ))}
      </div>
      <div className="text-center text-[10px] text-[#6b5537] pt-1">
        Type letters on your keyboard
      </div>
    </div>
  );
}
