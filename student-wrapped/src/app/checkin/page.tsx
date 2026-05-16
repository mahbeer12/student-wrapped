"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface FormData {
  sleep_hours: number;
  stress_level: number;
  study_minutes: number;
  academic_load: number;
  energy_level: number;
}

const FIELDS = [
  {
    key: "sleep_hours" as keyof FormData,
    emoji: "🌙",
    label: "Sleep Duration",
    question: "How much did you sleep last night?",
    min: 0, max: 12, step: 0.5,
    format: (v: number) => v + "h",
    hint: (v: number) => v < 6 ? "That's rough 😴" : v < 7 ? "Almost there" : v >= 8 ? "Well rested ✨" : "Solid rest",
    color: "#7c3aed",
    gradient: "linear-gradient(135deg, #1e1b4b, #7c3aed)",
  },
  {
    key: "stress_level" as keyof FormData,
    emoji: "🌊",
    label: "Stress Level",
    question: "How stressed are you feeling today?",
    min: 1, max: 10, step: 1,
    format: (v: number) => v + "/10",
    hint: (v: number) => v <= 3 ? "In the zone 🧘" : v <= 6 ? "Manageable" : v <= 8 ? "Feeling the pressure" : "Rough day 💙",
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #7f1d1d, #ec4899)",
  },
  {
    key: "study_minutes" as keyof FormData,
    emoji: "📚",
    label: "Focused Study Time",
    question: "How many minutes did you focus today?",
    min: 0, max: 480, step: 15,
    format: (v: number) => {
      if (v === 0) return "0m";
      const h = Math.floor(v / 60);
      const m = v % 60;
      if (h === 0) return m + "m";
      return m > 0 ? h + "h " + m + "m" : h + "h";
    },
    hint: (v: number) => v === 0 ? "Rest day?" : v < 30 ? "Light day" : v < 120 ? "Good session" : v >= 240 ? "Deep work mode 🔥" : "Solid focus",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #065f46, #06b6d4)",
  },
  {
    key: "academic_load" as keyof FormData,
    emoji: "🎯",
    label: "Academic Load",
    question: "How many major tasks did you have today?",
    min: 0, max: 10, step: 1,
    format: (v: number) => v === 0 ? "None" : v === 1 ? "1 task" : v + " tasks",
    hint: (v: number) => v === 0 ? "Clear schedule" : v <= 2 ? "Light load" : v <= 4 ? "Balanced" : v <= 6 ? "Busy day" : "Maximum load 📦",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #134e4a, #10b981)",
  },
  {
    key: "energy_level" as keyof FormData,
    emoji: "⚡",
    label: "Energy Level",
    question: "How is your energy right now?",
    min: 1, max: 10, step: 1,
    format: (v: number) => v + "/10",
    hint: (v: number) => v <= 3 ? "Running on empty" : v <= 5 ? "Getting by" : v <= 7 ? "Feeling good" : "High energy! ⚡",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #78350f, #f59e0b)",
  },
];

const INITIAL: FormData = { sleep_hours: 7, stress_level: 5, study_minutes: 120, academic_load: 3, energy_level: 6 };

export default function CheckInPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const isSummary = step === FIELDS.length;
  const isDone = step === FIELDS.length + 1;
  const field = FIELDS[Math.min(step, FIELDS.length - 1)];

const handleSubmit = async () => {
  setSaving(true);
  try {
    const supabase = createClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from("checkins")
          .upsert({
            user_id: user.id,
            date: new Date().toISOString().split("T")[0],
            sleep_hours: form.sleep_hours,
            stress_level: form.stress_level,
            study_minutes: form.study_minutes,
            academic_load: form.academic_load,
            energy_level: form.energy_level,
          }, { onConflict: "user_id,date" });
        if (error) console.error("Save error:", error);
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    setSaving(false);
    setStep(FIELDS.length + 1);
  }
};

  if (isDone) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }} className="glass rounded-3xl p-10 text-center max-w-sm w-full">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="text-6xl mb-6">✅</motion.div>
          <h2 className="font-display font-bold text-2xl mb-2">Logged!</h2>
          <p className="text-white/50 mb-8">Today's check-in is saved. See you tomorrow.</p>
          <div className="space-y-3">
            <Link href="/dashboard" className="block w-full py-3.5 rounded-2xl font-display font-semibold text-center hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>View dashboard</Link>
            <Link href="/wrapped" className="block w-full py-3.5 rounded-2xl font-display font-semibold text-center glass border border-white/10 hover:border-white/25 transition-colors">
              View my Wrapped ✨</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isSummary) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
          <div className="glass rounded-3xl p-8">
            <h2 className="font-display font-bold text-2xl mb-1">Today's summary</h2>
            <p className="text-white/40 text-sm mb-7">Review before saving</p>
            <div className="space-y-3 mb-8">
              {FIELDS.map(f => (
                <div key={f.key} className="flex items-center justify-between p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{f.emoji}</span>
                    <span className="text-white/60 text-sm">{f.label}</span>
                  </div>
                  <span className="font-display font-semibold" style={{ color: f.color }}>{f.format(form[f.key])}</span>
                </div>
              ))}
            </div>
            <button onClick={handleSubmit} disabled={saving}
              className="w-full py-4 rounded-2xl font-display font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
              {saving ? "Saving..." : "Save check-in →"}
            </button>
            <button onClick={() => setStep(FIELDS.length - 1)} className="w-full mt-3 py-3 text-white/40 text-sm hover:text-white/70 transition-colors">
              Edit
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentValue = form[field.key];
  const pct = ((currentValue - field.min) / (field.max - field.min)) * 100;

  return (
    <div className="min-h-screen animated-bg flex flex-col items-center justify-center px-6">
      <div className="fixed inset-0 pointer-events-none">
        <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ duration: 0.6 }}
          className="absolute inset-0" style={{ background: "radial-gradient(ellipse at top right, " + field.color + "88, transparent 60%)" }} />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} className="text-white/30 hover:text-white/70 transition-colors text-sm w-16 text-left">
            {step > 0 ? "Back" : ""}
          </button>
          <div className="flex gap-1.5">
            {FIELDS.map((_, i) => (
              <div key={i} className="h-1 rounded-full transition-all duration-300"
                style={{ width: i === step ? 20 : 8, background: i <= step ? field.color : "rgba(255,255,255,0.15)" }} />
            ))}
          </div>
          <Link href="/dashboard" className="text-white/30 hover:text-white/70 transition-colors text-sm w-16 text-right">Skip</Link>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}>
            <div className="mb-10 text-center">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="text-6xl mb-6">{field.emoji}</motion.div>
              <h2 className="font-display font-bold text-2xl md:text-3xl leading-tight">{field.question}</h2>
            </div>
            <div className="glass rounded-3xl p-8 mb-6">
              <div className="text-center mb-8">
                <motion.div key={currentValue} initial={{ scale: 0.85, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }}
                  className="font-display font-bold text-5xl mb-2" style={{ color: field.color }}>
                  {field.format(currentValue)}
                </motion.div>
                <motion.p key={field.hint(currentValue)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-white/40 text-sm">
                  {field.hint(currentValue)}
                </motion.p>
              </div>
              <div className="relative mb-4">
                <div className="relative h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <motion.div className="absolute left-0 top-0 h-full rounded-full" animate={{ width: pct + "%" }}
                    transition={{ duration: 0.05 }} style={{ background: field.gradient }} />
                </div>
                <input type="range" min={field.min} max={field.max} step={field.step} value={currentValue}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: parseFloat(e.target.value) }))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer" style={{ height: "24px", top: "-8px" }} />
              </div>
              <div className="flex justify-between text-white/25 text-xs font-mono">
                <span>{field.format(field.min)}</span>
                <span>{field.format(field.max)}</span>
              </div>
            </div>
            <button onClick={() => setStep(s => s + 1)}
              className="w-full py-4 rounded-2xl font-display font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: field.gradient }}>
              {step < FIELDS.length - 1 ? "Next" : "Review"}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
