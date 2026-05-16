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

const CHECKIN_FIELDS = [
  {
    key: "sleep_hours",
    emoji: "🌙",
    label: "Sleep Duration",
    question: "How much did you sleep last night?",
    min: 0, max: 12, step: 0.5,
    format: (v: number) => v + "h",
    hint: (v: number) => v < 6 ? "That is rough 😴" : v >= 8 ? "Well rested ✨" : "Solid rest",
    color: "#7c3aed",
    gradient: "linear-gradient(135deg, #1e1b4b, #7c3aed)",
  },
  {
    key: "stress_level",
    emoji: "🌊",
    label: "Stress Level",
    question: "How stressed are you feeling today?",
    min: 1, max: 10, step: 1,
    format: (v: number) => v + "/10",
    hint: (v: number) => v <= 3 ? "Nice and calm 🧘" : v <= 6 ? "Manageable" : "Feeling the pressure",
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #7f1d1d, #ec4899)",
  },
  {
    key: "study_minutes",
    emoji: "📚",
    label: "Study Time",
    question: "How many minutes did you study today?",
    min: 0, max: 480, step: 15,
    format: (v: number) => {
      if (v === 0) return "0m";
      const h = Math.floor(v / 60);
      const m = v % 60;
      if (h === 0) return m + "m";
      return m > 0 ? h + "h " + m + "m" : h + "h";
    },
    hint: (v: number) => v === 0 ? "Rest day?" : v < 60 ? "Light day" : v >= 240 ? "Deep work! 🔥" : "Good session",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #065f46, #06b6d4)",
  },
  {
    key: "academic_load",
    emoji: "🎯",
    label: "Academic Load",
    question: "How many major tasks did you have today?",
    min: 0, max: 10, step: 1,
    format: (v: number) => v === 0 ? "None" : v === 1 ? "1 task" : v + " tasks",
    hint: (v: number) => v === 0 ? "Clear schedule" : v <= 3 ? "Light load" : v <= 6 ? "Busy day" : "Maximum load 📦",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #134e4a, #10b981)",
  },
  {
    key: "energy_level",
    emoji: "⚡",
    label: "Energy Level",
    question: "How is your energy right now?",
    min: 1, max: 10, step: 1,
    format: (v: number) => v + "/10",
    hint: (v: number) => v <= 3 ? "Running on empty" : v <= 6 ? "Getting by" : v >= 8 ? "High energy! ⚡" : "Feeling good",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #78350f, #f59e0b)",
  },
];

interface CheckInData {
  sleep_hours: number;
  stress_level: number;
  study_minutes: number;
  academic_load: number;
  energy_level: number;
}

const INITIAL_CHECKIN: CheckInData = {
  sleep_hours: 7,
  stress_level: 5,
  study_minutes: 120,
  academic_load: 3,
  energy_level: 6,
};

type Phase = "welcome" | "how_it_works" | "goal" | "first_checkin" | "done";

export default function OnboardingPage() {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [checkinStep, setCheckinStep] = useState(0);
  const [goalFocus, setGoalFocus] = useState("consistency");
  const [checkin, setCheckin] = useState<CheckInData>(INITIAL_CHECKIN);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const field = CHECKIN_FIELDS[checkinStep];

  const handleFinish = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Save first real check-in
          await supabase.from("checkins").upsert({
            user_id: user.id,
            date: new Date().toISOString().split("T")[0],
            ...checkin,
          }, { onConflict: "user_id,date" });

          // Mark onboarding complete
          await supabase.from("user_profiles").upsert({
            user_id: user.id,
            goal_focus: goalFocus,
            onboarding_completed: true,
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
      setPhase("done");
    }
  };

  // WELCOME
  if (phase === "welcome") {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center px-6">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="relative z-10 glass rounded-3xl p-10 text-center max-w-md w-full">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl mb-6">🎓</motion.div>
          <h1 className="font-display font-bold text-3xl mb-3">
            Welcome to <span className="gradient-text">Student Wrapped</span>
          </h1>
          <p className="text-white/55 leading-relaxed mb-8">
            Track your daily habits in under 45 seconds. Every 7 days, your data becomes a beautiful weekly recap showing patterns in your sleep, stress, and study habits.
          </p>
          <button onClick={() => setPhase("how_it_works")}
            className="w-full py-4 rounded-2xl font-display font-semibold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
            See how it works →
          </button>
        </motion.div>
      </div>
    );
  }

  // HOW IT WORKS
  if (phase === "how_it_works") {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center px-6 py-12">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)" }} />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md">
          <div className="glass rounded-3xl p-8 mb-4">
            <h2 className="font-display font-bold text-2xl mb-6 text-center">How it works</h2>
            <div className="space-y-5">
              {[
                {
                  step: "1",
                  emoji: "⏱️",
                  title: "Daily check-in (45 sec)",
                  desc: "Every day, log 5 things: sleep, stress, study time, workload, and energy.",
                  color: "#7c3aed",
                },
                {
                  step: "2",
                  emoji: "📊",
                  title: "Data accumulates",
                  desc: "Your check-ins build up over the week. No instant results — real patterns take time.",
                  color: "#06b6d4",
                },
                {
                  step: "3",
                  emoji: "✨",
                  title: "Weekly Wrapped",
                  desc: "After 7 check-ins, your data becomes a Spotify Wrapped-style story with real behavioral insights.",
                  color: "#ec4899",
                },
                {
                  step: "4",
                  emoji: "🔁",
                  title: "Repeat every week",
                  desc: "Each week builds on the last. Over time, you'll see long-term patterns in your habits.",
                  color: "#f59e0b",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-display font-bold flex-shrink-0"
                    style={{ background: item.color + "33", color: item.color }}>
                    {item.step}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{item.emoji}</span>
                      <span className="font-display font-semibold text-sm">{item.title}</span>
                    </div>
                    <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Example wrapped preview */}
          <div className="glass rounded-2xl p-5 mb-4"
            style={{ border: "1px solid rgba(124,58,237,0.2)" }}>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Example Wrapped card</p>
            <div className="rounded-xl p-4 text-center"
              style={{ background: "linear-gradient(135deg, #1e1b4b, #7c3aed)" }}>
              <div className="text-3xl mb-2">🌙</div>
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Your sleep story</p>
              <p className="font-display font-bold text-2xl mb-1">7.2h average</p>
              <p className="text-white/60 text-sm">You slept best on Thursday. Consistency score: 84%</p>
            </div>
          </div>

          <button onClick={() => setPhase("goal")}
            className="w-full py-4 rounded-2xl font-display font-semibold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
            Got it — set my goal →
          </button>
          <button onClick={() => setPhase("welcome")}
            className="w-full mt-3 py-2 text-white/30 text-sm hover:text-white/60 transition-colors">
            Back
          </button>
        </motion.div>
      </div>
    );
  }

  // GOAL SELECTION
  if (phase === "goal") {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="relative z-10 glass rounded-3xl p-10 text-center max-w-md w-full">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="font-display font-bold text-2xl mb-2">What is your main goal?</h2>
          <p className="text-white/40 text-sm mb-8">This shapes your weekly insights</p>
          <div className="space-y-3 mb-8">
            {GOALS.map(g => (
              <button key={g.value} onClick={() => setGoalFocus(g.value)}
                className="w-full py-3.5 px-5 rounded-2xl text-left font-medium transition-all"
                style={{
                  background: goalFocus === g.value ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.05)",
                  border: goalFocus === g.value ? "1px solid rgba(124,58,237,0.6)" : "1px solid rgba(255,255,255,0.08)",
                }}>
                {g.label}
              </button>
            ))}
          </div>
          <button onClick={() => setPhase("first_checkin")}
            className="w-full py-4 rounded-2xl font-display font-semibold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
            Now do your first check-in →
          </button>
          <button onClick={() => setPhase("how_it_works")}
            className="w-full mt-3 py-2 text-white/30 text-sm hover:text-white/60 transition-colors">
            Back
          </button>
        </motion.div>
      </div>
    );
  }

  // DONE
  if (phase === "done") {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-10 text-center max-w-sm w-full">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl mb-6">🎉</motion.div>
          <h2 className="font-display font-bold text-2xl mb-2">Day 1 complete!</h2>
          <p className="text-white/50 mb-3 leading-relaxed">
            Your first check-in is saved. Come back tomorrow and keep the streak going.
          </p>
          <p className="text-white/30 text-sm mb-8">
            Your Wrapped unlocks after 7 check-ins.
          </p>
          <button onClick={() => router.push("/dashboard")}
            className="w-full py-4 rounded-2xl font-display font-semibold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
            Go to my dashboard →
          </button>
        </motion.div>
      </div>
    );
  }

  // FIRST REAL CHECK-IN (slider flow)
  const currentValue = checkin[field.key as keyof CheckInData] as number;
  const pct = ((currentValue - field.min) / (field.max - field.min)) * 100;
  const isLastField = checkinStep === CHECKIN_FIELDS.length - 1;

  return (
    <div className="min-h-screen animated-bg flex flex-col items-center justify-center px-6">
      <div className="fixed inset-0 pointer-events-none">
        <motion.div key={checkinStep} initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ duration: 0.6 }}
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at top right, " + field.color + "88, transparent 60%)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => checkinStep > 0 ? setCheckinStep(s => s - 1) : setPhase("goal")}
            className="text-white/30 hover:text-white/70 transition-colors text-sm w-16 text-left">Back</button>
          <div>
            <p className="text-white/40 text-xs text-center mb-2">Your first check-in</p>
            <div className="flex gap-1.5">
              {CHECKIN_FIELDS.map((_, i) => (
                <div key={i} className="h-1 rounded-full transition-all duration-300"
                  style={{ width: i === checkinStep ? 20 : 8, background: i <= checkinStep ? field.color : "rgba(255,255,255,0.15)" }} />
              ))}
            </div>
          </div>
          <div className="w-16 text-right text-white/30 text-xs">{checkinStep + 1}/{CHECKIN_FIELDS.length}</div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={checkinStep} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <div className="mb-10 text-center">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl mb-6">{field.emoji}</motion.div>
              <h2 className="font-display font-bold text-2xl md:text-3xl leading-tight">{field.question}</h2>
            </div>

            <div className="glass rounded-3xl p-8 mb-6">
              <div className="text-center mb-8">
                <motion.div key={currentValue} initial={{ scale: 0.85, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }}
                  className="font-display font-bold text-5xl mb-2" style={{ color: field.color }}>
                  {field.format(currentValue)}
                </motion.div>
                <p className="text-white/40 text-sm">{field.hint(currentValue)}</p>
              </div>
              <div className="relative mb-4">
                <div className="relative h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <motion.div className="absolute left-0 top-0 h-full rounded-full"
                    animate={{ width: pct + "%" }} transition={{ duration: 0.05 }}
                    style={{ background: field.gradient }} />
                </div>
                <input type="range" min={field.min} max={field.max} step={field.step} value={currentValue}
                  onChange={e => setCheckin(prev => ({ ...prev, [field.key]: parseFloat(e.target.value) }))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer" style={{ height: "24px", top: "-8px" }} />
              </div>
              <div className="flex justify-between text-white/25 text-xs font-mono">
                <span>{field.format(field.min)}</span>
                <span>{field.format(field.max)}</span>
              </div>
            </div>

            <button
              onClick={() => isLastField ? handleFinish() : setCheckinStep(s => s + 1)}
              disabled={saving}
              className="w-full py-4 rounded-2xl font-display font-semibold text-base transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: field.gradient }}>
              {saving ? "Saving..." : isLastField ? "Save my first check-in ✓" : "Next →"}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}