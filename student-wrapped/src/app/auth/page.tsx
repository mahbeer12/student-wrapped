"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const GOALS = [
  { value: "focus", label: "🎯 Better Focus" },
  { value: "consistency", label: "📅 Build Consistency" },
  { value: "stress", label: "🧘 Reduce Stress" },
  { value: "time", label: "⏰ Time Management" },
  { value: "sleep", label: "🌙 Improve Sleep" },
];

const FIELDS = [
  {
    key: "baseline_sleep",
    emoji: "🌙",
    label: "Average Sleep",
    question: "How many hours do you usually sleep?",
    min: 3, max: 12, step: 0.5,
    format: (v: number) => v + "h",
    hint: (v: number) => v < 6 ? "That is quite low" : v >= 8 ? "Great baseline!" : "Pretty typical",
    color: "#7c3aed",
    gradient: "linear-gradient(135deg, #1e1b4b, #7c3aed)",
  },
  {
    key: "baseline_stress",
    emoji: "🌊",
    label: "Stress Level",
    question: "What is your usual stress level?",
    min: 1, max: 10, step: 1,
    format: (v: number) => v + "/10",
    hint: (v: number) => v <= 3 ? "Nice and calm" : v <= 6 ? "Manageable" : "High baseline",
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #7f1d1d, #ec4899)",
  },
  {
    key: "baseline_productivity",
    emoji: "📚",
    label: "Productivity",
    question: "How productive do you feel on a typical day?",
    min: 1, max: 10, step: 1,
    format: (v: number) => v + "/10",
    hint: (v: number) => v <= 4 ? "Room to grow" : v <= 7 ? "Solid" : "High performer!",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #065f46, #06b6d4)",
  },
  {
    key: "baseline_workload",
    emoji: "🎯",
    label: "Workload",
    question: "How heavy is your typical academic workload?",
    min: 1, max: 10, step: 1,
    format: (v: number) => v + "/10",
    hint: (v: number) => v <= 3 ? "Light load" : v <= 6 ? "Balanced" : "Heavy load",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #134e4a, #10b981)",
  },
];

interface FormData {
  baseline_sleep: number;
  baseline_stress: number;
  baseline_productivity: number;
  baseline_workload: number;
  goal_focus: string;
}

const INITIAL: FormData = {
  baseline_sleep: 7,
  baseline_stress: 5,
  baseline_productivity: 6,
  baseline_workload: 5,
  goal_focus: "consistency",
};

export default function OnboardingPage() {
  const [phase, setPhase] = useState<"welcome" | "sliders" | "goal" | "snapshot">("welcome");
  const [sliderStep, setSliderStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const currentField = FIELDS[sliderStep];

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("user_profiles").upsert({
            user_id: user.id,
            ...form,
            onboarding_completed: true,
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
      setPhase("snapshot");
    }
  };

  if (phase === "welcome") {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center px-6">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} className="relative z-10 glass rounded-3xl p-10 text-center max-w-md w-full">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl mb-6">🎓</motion.div>
          <h1 className="font-display font-bold text-3xl mb-3">
            Welcome to <span className="gradient-text">Student Wrapped</span>
          </h1>
          <p className="text-white/55 leading-relaxed mb-4">
            Every day you log a 45-second check-in. Every week, your data becomes a beautiful story about your habits, patterns, and growth.
          </p>
          <p className="text-white/40 text-sm mb-10">
            First, let us set your baseline so your very first Wrapped has something meaningful to show.
          </p>
          <button onClick={() => setPhase("sliders")}
            className="w-full py-4 rounded-2xl font-display font-semibold text-base hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
            Set my baseline →
          </button>
        </motion.div>
      </div>
    );
  }

  if (phase === "goal") {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="relative z-10 glass rounded-3xl p-10 text-center max-w-md w-full">
          <div className="text-5xl mb-6">🏆</div>
          <h2 className="font-display font-bold text-2xl mb-2">What is your main goal?</h2>
          <p className="text-white/40 text-sm mb-8">This shapes your weekly insights</p>
          <div className="space-y-3 mb-8">
            {GOALS.map(g => (
              <button key={g.value} onClick={() => setForm(f => ({ ...f, goal_focus: g.value }))}
                className="w-full py-3.5 px-5 rounded-2xl text-left font-medium transition-all"
                style={{
                  background: form.goal_focus === g.value ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.05)",
                  border: form.goal_focus === g.value ? "1px solid rgba(124,58,237,0.6)" : "1px solid rgba(255,255,255,0.08)",
                }}>
                {g.label}
              </button>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving}
            className="w-full py-4 rounded-2xl font-display font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
            {saving ? "Saving..." : "Generate my baseline →"}
          </button>
        </motion.div>
      </div>
    );
  }

  if (phase === "snapshot") {
    const goalLabel = GOALS.find(g => g.value === form.goal_focus)?.label || "Consistency";
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-md">
          <div className="glass rounded-3xl p-10 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="text-6xl mb-6">✨</motion.div>
            <h2 className="font-display font-bold text-2xl mb-2">Your Starting Snapshot</h2>
            <p className="text-white/40 text-sm mb-8">This is your baseline. Your Wrapped improves as you log daily data.</p>
            <div className="space-y-3 mb-8">
              {[
                { emoji: "🌙", label: "Sleep baseline", value: form.baseline_sleep + "h", color: "#7c3aed" },
                { emoji: "🌊", label: "Stress baseline", value: form.baseline_stress + "/10", color: "#ec4899" },
                { emoji: "📚", label: "Productivity baseline", value: form.baseline_productivity + "/10", color: "#06b6d4" },
                { emoji: "🎯", label: "Workload baseline", value: form.baseline_workload + "/10", color: "#10b981" },
                { emoji: "🏆", label: "Focus goal", value: goalLabel, color: "#f59e0b" },
              ].map(item => (
                <motion.div key={item.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-white/60 text-sm">{item.label}</span>
                  </div>
                  <span className="font-display font-semibold" style={{ color: item.color }}>{item.value}</span>
                </motion.div>
              ))}
            </div>
            <button onClick={() => router.push("/dashboard")}
              className="w-full py-4 rounded-2xl font-display font-semibold text-base hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
              Enter my dashboard →
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentValue = form[currentField.key as keyof FormData] as number;
  const pct = ((currentValue - currentField.min) / (currentField.max - currentField.min)) * 100;

  return (
    <div className="min-h-screen animated-bg flex flex-col items-center justify-center px-6">
      <div className="fixed inset-0 pointer-events-none">
        <motion.div key={sliderStep} initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ duration: 0.6 }}
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at top right, " + currentField.color + "88, transparent 60%)" }} />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => sliderStep > 0 ? setSliderStep(s => s - 1) : setPhase("welcome")}
            className="text-white/30 hover:text-white/70 transition-colors text-sm w-16 text-left">Back</button>
          <div className="flex gap-1.5">
            {FIELDS.map((_, i) => (
              <div key={i} className="h-1 rounded-full transition-all duration-300"
                style={{ width: i === sliderStep ? 20 : 8, background: i <= sliderStep ? currentField.color : "rgba(255,255,255,0.15)" }} />
            ))}
          </div>
          <div className="w-16 text-right text-white/30 text-xs">{sliderStep + 1}/{FIELDS.length}</div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={sliderStep} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <div className="mb-10 text-center">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl mb-6">{currentField.emoji}</motion.div>
              <h2 className="font-display font-bold text-2xl md:text-3xl leading-tight">{currentField.question}</h2>
            </div>
            <div className="glass rounded-3xl p-8 mb-6">
              <div className="text-center mb-8">
                <motion.div key={currentValue} initial={{ scale: 0.85, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }}
                  className="font-display font-bold text-5xl mb-2" style={{ color: currentField.color }}>
                  {currentField.format(currentValue)}
                </motion.div>
                <p className="text-white/40 text-sm">{currentField.hint(currentValue)}</p>
              </div>
              <div className="relative mb-4">
                <div className="relative h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <motion.div className="absolute left-0 top-0 h-full rounded-full"
                    animate={{ width: pct + "%" }} transition={{ duration: 0.05 }}
                    style={{ background: currentField.gradient }} />
                </div>
                <input type="range" min={currentField.min} max={currentField.max} step={currentField.step}
                  value={currentValue}
                  onChange={e => setForm(prev => ({ ...prev, [currentField.key]: parseFloat(e.target.value) }))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer" style={{ height: "24px", top: "-8px" }} />
              </div>
              <div className="flex justify-between text-white/25 text-xs font-mono">
                <span>{currentField.format(currentField.min)}</span>
                <span>{currentField.format(currentField.max)}</span>
              </div>
            </div>
            <button onClick={() => sliderStep < FIELDS.length - 1 ? setSliderStep(s => s + 1) : setPhase("goal")}
              className="w-full py-4 rounded-2xl font-display font-semibold text-base transition-all hover:opacity-90"
              style={{ background: currentField.gradient }}>
              {sliderStep < FIELDS.length - 1 ? "Next →" : "Choose my goal →"}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}