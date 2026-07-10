import { motion, AnimatePresence, useReducedMotion } from "motion/react";

export type FeedbackTone = "success" | "danger" | "streak" | "combo";

interface GameFeedbackProps {
  text: string | null;
  tone?: FeedbackTone;
}

const toneStyles: Record<FeedbackTone, string> = {
  success: "bg-emerald-700 text-white border-emerald-500",
  danger: "bg-rose-700 text-white border-rose-500",
  streak: "bg-[#b45309] text-white border-[#f5b301]/50",
  combo: "bg-violet-700 text-white border-violet-500",
};

export default function GameFeedback({ text, tone = "success" }: GameFeedbackProps) {
  const rm = useReducedMotion();
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          key={text}
          initial={rm ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.85 }}
          animate={rm ? { opacity: 1 } : { opacity: 1, y: -20, scale: 1 }}
          exit={rm ? { opacity: 0 } : { opacity: 0, y: -40, scale: 0.9 }}
          transition={rm ? { duration: 0.15 } : { type: "spring", stiffness: 400, damping: 22 }}
          className={`fixed top-24 left-1/2 -translate-x-1/2 z-40 font-bold px-5 py-2.5 rounded-full text-sm tracking-wide shadow-lg border ${toneStyles[tone]}`}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
