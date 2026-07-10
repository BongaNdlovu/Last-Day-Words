import { useState } from "react";
import { BookOpen, Clock, Trophy, Zap } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: Zap,
    title: "Welcome to Last Day Words",
    body: "A prophetic speed arcade: read the clue, type letters, race the clock. Perfect solves earn extra XP.",
  },
  {
    icon: Clock,
    title: "Two speed boards",
    body: "Mixed Speed uses the expansion pool. Chapter Speed picks one core prophecy track. Each has its own weekly leaderboard.",
  },
  {
    icon: BookOpen,
    title: "Learn as you play",
    body: "After each solve you’ll see the verse—tap Continue when you’re ready. The timer pauses while you read.",
  },
  {
    icon: Trophy,
    title: "Your first rounds are gentler",
    body: "The first Mixed and first Chapter runs give more time and shorter terms so you can settle in. Then full speed!",
  },
] as const;

export default function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const rm = useReducedMotion();
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step >= STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <motion.div
        key={step}
        initial={rm ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="pcard rounded-2xl p-6 md:p-8 max-w-md w-full space-y-5 parchment-glow"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#101014] text-[#fbbf24] flex items-center justify-center border border-[#f5b301]/40">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a49b8d]">
            Quick start · {step + 1}/{STEPS.length}
          </div>
        </div>

        <h2 id="onboarding-title" className="text-xl font-display font-bold text-[#f4f1ea] tracking-wide">
          {current.title}
        </h2>
        <p className="text-sm text-[#c9c2b4] leading-relaxed">{current.body}</p>

        <div className="flex gap-1.5 justify-center pt-1">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-[#b45309]" : "w-1.5 bg-white/15"
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              if (isLast) onComplete();
              else setStep((s) => s + 1);
            }}
            className="w-full py-3 bg-[#101014] hover:bg-black text-[#f8f1e3] rounded-xl text-sm font-bold uppercase tracking-wider cursor-pointer"
          >
            {isLast ? "Let’s play" : "Next"}
          </button>
          {!isLast && (
            <button
              type="button"
              onClick={onComplete}
              className="w-full py-2 text-xs font-semibold text-[#a49b8d] hover:text-[#f4f1ea] cursor-pointer"
            >
              Skip tutorial
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
