"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const steps = [
  {
    id: 0,
    emoji: "👋",
    title: "Welcome to Student Wrapped",
    subtitle: "Your personal academic reflection platform",
    body: "In under 45 seconds a day, you'll track the habits that matter most — and every 7 days, see them transformed into a beautiful recap.",
    cta: "Let's get started",
  },
  {
    id: 1,
    emoji: "⏱️",
    title: "Check-ins take under 45 seconds",
    subtitle: "Five fields. Zero friction.",
    body: "Sleep hours, stress level, study time, academic load, and energy level. That's it. We keep it minimal so you actually do it.",
    cta: "Got it",
  },
  {
    id: 2,
    emoji: "📊",
    title: "Watch patterns emerge",
    subtitle: "Data tells the story you cannot see",
    body: "After a few days, you'll start seeing correlations — how sleep shapes energy, how load drives stress. Your dashboard reveals it all.",
    cta: "Keep going",
  },
  {
    id: 3,
    emoji: "🎬",
    title: "Your Weekly Wrapped",
    subtitle: "Every 7 days, something special happens",
    body: "We take your week of data and turn it into a Spotify Wrapped-style experience. Card by card. Insight by insight. Built just for you.",
    cta: "Start tracking →",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const current = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      router.push("/checkin");
    }
  };

  return (
    <div className="min-h-screen animated-bg flex flex-col items-center justify-center px-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {steps.map((s, i) => (
            <motion.div
              key={s.id}
              animate={{ width: i === step ? 24 : 8, opacity: i <= step ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
              className="h-2 rounded-full"
              style={{ background: i === step ? "linear-gradient(90deg,#7c3aed,#ec4899)" : "rgba(255,255,255,0.3)" }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="glass rounded-3xl p-10 text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl mb-6"
            >
              {current.emoji}
            </motion.div>

            <h1 className="font-display font-bold text-2xl md:text-3xl mb-2 leading-tight">
              {current.title}
            </h1>
            <p className="gradient-text font-display font-semibold text-base mb-5">
              {current.subtitle}
            </p>
            <p className="text-white/55 leading-relaxed mb-10">{current.body}</p>

            <button
              onClick={handleNext}
              className="w-full py-4 rounded-2xl font-display font-semibold text-base transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
            >
              {current.cta}
            </button>

            {step < steps.length - 1 && (
              <button
                onClick={() => router.push("/dashboard")}
                className="mt-4 text-white/30 text-sm hover:text-white/60 transition-colors w-full"
              >
                Skip to dashboard
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
