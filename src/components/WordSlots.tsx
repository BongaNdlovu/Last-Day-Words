import { motion, useReducedMotion } from "motion/react";
import { isLetter } from "../utils/gameLogic";

interface WordSlotsProps {
  wordText: string;
  guessedLetters: string[];
  mistakes: number;
  maxMistakes: number;
  size?: "normal" | "compact";
  /** When false, failing the word does not fill in unguessed letters */
  revealOnFailure?: boolean;
}

export default function WordSlots({
  wordText,
  guessedLetters,
  mistakes,
  maxMistakes,
  size = "normal",
  revealOnFailure = true,
}: WordSlotsProps) {
  const rm = useReducedMotion();
  const subWords = wordText.split(" ");
  const slotClass =
    size === "compact"
      ? "w-6 h-8 sm:w-8 sm:h-10 text-sm sm:text-base"
      : "w-7 h-10 sm:w-11 sm:h-14 text-xl sm:text-2xl";

  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 py-6">
      {subWords.map((word, wordIdx) => (
        <div key={wordIdx} className="flex gap-1.5">
          {word.split("").map((char, charIdx) => {
            const letterMatch = isLetter(char);
            const isGuessed =
              guessedLetters.includes(char) || (revealOnFailure && mistakes >= maxMistakes);
            const justRevealed = letterMatch && isGuessed && guessedLetters.includes(char);

            return (
              <motion.div
                key={charIdx}
                initial={justRevealed && !rm ? { scale: 0.8, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                transition={rm ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 20 }}
                className={`${slotClass} flex items-center justify-center font-semibold font-mono transition-colors duration-300 ${
                  !letterMatch
                    ? "text-[#e8e3d8] w-3 bg-transparent"
                    : isGuessed
                    ? "border-b-4 border-[#f5b301]/60 text-[#f4f1ea]"
                    : "border-b-4 border-white/20 text-transparent"
                }`}
              >
                {letterMatch ? (isGuessed ? char : "") : char}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
