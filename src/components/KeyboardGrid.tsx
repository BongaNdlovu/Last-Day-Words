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

  let btnStyles = "bg-white/[0.06] hover:bg-[#101014] hover:text-[#f8f1e3] text-[#e8e3d8] border-white/10";
  if (isGuessed) {
    btnStyles = isCorrect
      ? "bg-[#101014] text-[#f8f1e3] border-[#f5b301]/60 font-semibold cursor-default hover:bg-[#101014]"
      : "bg-white/[0.08] text-[#8d857a] border-white/10 cursor-default line-through hover:bg-white/10";
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
    <div
      role="group"
      aria-label="On-screen keyboard"
      data-no-button-sfx
      className="psunken p-4 rounded-xl max-w-2xl mx-auto space-y-2"
    >
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
      <div className="text-center text-[10px] text-[#a49b8d] pt-1">
        Type letters on your keyboard
      </div>
    </div>
  );
}
