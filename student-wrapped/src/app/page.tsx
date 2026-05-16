"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const statCards = [
  { emoji: "🌙", label: "Avg Sleep", value: "7.2h", color: "#7c3aed" },
  { emoji: "📚", label: "Study Streak", value: "12 days", color: "#06b6d4" },
  { emoji: "⚡", label: "Energy Score", value: "8.1/10", color: "#f59e0b" },
  { emoji: "🌊", label: "Stress Avg", value: "4.3/10", color: "#ec4899" },
];

const featureItems = [
  {
    icon: "⏱️",
    title: "45-second check-ins",
    desc: "Five quick fields. No journaling required. Just data.",
  },
  {
    icon: "📊",
    title: "Behavioral patterns",
    desc: "See how sleep affects your energy. How stress follows load.",
  },
  {
    icon: "🎬",
    title: "Weekly Wrapped",
    desc: "Every 7 days, your data becomes a cinematic story.",
  },
  {
    icon: "🔥",
    title: "Streak system",
    desc: "Build the habit of reflection. Watch consistency compound.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen animated-bg text-white overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)" }}
        />
        <div
          className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)" }}
        />
      </div>

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="font-display font-semibold text-lg tracking-tight">
            Student <span className="gradient-text">Wrapped</span>
          </span>
        </div>
        <Link
          href="/auth"
          className="glass glass-hover px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:glow-violet"
        >
          Get started →
        </Link>
      </motion.nav>

      {/* Hero */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-32 text-center">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs text-white/60 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Now in beta · Free for students
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="font-display font-bold text-5xl md:text-7xl leading-[1.05] tracking-tight mb-6"
        >
          Your student life,{" "}
          <br />
          <span className="gradient-text-aurora">wrapped up.</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-white/55 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12"
        >
          Track sleep, stress, and study habits in under a minute. Every 7 days,
          get a cinematic recap that reveals patterns you never noticed.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link
            href="/auth"
            className="relative px-8 py-4 rounded-2xl font-display font-semibold text-base overflow-hidden group"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
          >
            <span className="relative z-10">Start tracking free →</span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "linear-gradient(135deg, #6d28d9, #db2777)" }} />
          </Link>
          <Link
            href="/dashboard"
            className="glass glass-hover px-8 py-4 rounded-2xl font-display font-semibold text-base text-white/70 hover:text-white"
          >
            View demo dashboard
          </Link>
        </motion.div>

        {/* Floating stat cards */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-24"
        >
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
              className="glass glass-hover rounded-2xl p-5 text-left"
            >
              <div className="text-2xl mb-3">{card.emoji}</div>
              <div
                className="font-display font-bold text-2xl mb-1"
                style={{ color: card.color }}
              >
                {card.value}
              </div>
              <div className="text-white/40 text-xs font-medium uppercase tracking-wider">
                {card.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-auto mb-16" />

        {/* Features */}
        <motion.h2
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="font-display font-semibold text-2xl md:text-3xl mb-12 text-white/80"
        >
          Built for how students actually live
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-4 text-left">
          {featureItems.map((f, i) => (
            <motion.div
              key={f.title}
              custom={6 + i}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="glass glass-hover rounded-2xl p-6 group cursor-default"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-display font-semibold text-lg mb-2 group-hover:gradient-text">
                {f.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA bottom */}
        <motion.div
          custom={10}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-24 relative rounded-3xl overflow-hidden p-12"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(236,72,153,0.2))" }}
        >
          <div className="absolute inset-0 glass" />
          <div className="relative z-10">
            <div className="text-5xl mb-6">✨</div>
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
              What will your <span className="gradient-text">Wrapped</span> reveal?
            </h2>
            <p className="text-white/55 mb-8 max-w-lg mx-auto">
              Start checking in today. In 7 days, discover the patterns behind
              your best — and hardest — moments as a student.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-display font-semibold"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
            >
              Create your account →
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-16 text-white/25 text-sm">
          Made with 🎓 for students who actually care about their wellbeing
        </div>
      </main>
    </div>
  );
}
