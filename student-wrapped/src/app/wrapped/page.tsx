
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { generateInsights, computeWeeklyStats, generateDummyCheckins } from "@/lib/insights";
import type { CheckIn, WrappedInsight } from "@/types";

const DUMMY_USER_ID = "demo-user";

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="h-1 rounded-full transition-all duration-500"
          style={{ width: i === current ? 20 : 6, background: i <= current ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)" }} />
      ))}
    </div>
  );
}

function InsightCard({ insight, onNext, onPrev, isFirst, isLast, index, total }:
  { insight: WrappedInsight; onNext: () => void; onPrev: () => void; isFirst: boolean; isLast: boolean; index: number; total: number }) {
  return (
    <motion.div
      key={insight.id}
      initial={{ opacity: 0, scale: 0.92, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.04, y: -30 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden"
      style={{ background: insight.gradient }}
    >
      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

      {/* Glow blob */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.2), transparent 70%)" }} />
      </div>

      {/* Header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <Link href="/dashboard" className="text-white/50 hover:text-white text-sm transition-colors">Dashboard</Link>
        <ProgressDots total={total} current={index} />
        <div className="text-white/50 text-sm">{index + 1}/{total}</div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-sm w-full">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 180 }}
          className="text-7xl mb-8"
        >
          {insight.emoji}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/60 text-sm font-medium uppercase tracking-widest mb-4"
        >
          {insight.title}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display font-bold text-5xl md:text-6xl leading-none mb-6 text-white"
        >
          {insight.stat}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white/70 text-base md:text-lg leading-relaxed"
        >
          {insight.description}
        </motion.p>
      </div>

      {/* Nav buttons */}
      <div className="absolute bottom-10 left-6 right-6 flex items-center justify-between z-20">
        <button onClick={onPrev} disabled={isFirst}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
          style={{ background: "rgba(255,255,255,0.15)", opacity: isFirst ? 0.3 : 1 }}>
          ←
        </button>
        {isLast ? (
          <Link href="/dashboard"
            className="px-6 py-3 rounded-full font-display font-semibold text-sm"
            style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
            Back to dashboard ✓
          </Link>
        ) : (
          <button onClick={onNext}
            className="px-6 py-3 rounded-full font-display font-semibold text-sm transition-all hover:scale-105"
            style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
            Next →
          </button>
        )}
        <button onClick={onNext} disabled={isLast}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
          style={{ background: "rgba(255,255,255,0.15)", opacity: isLast ? 0.3 : 1 }}>
          →
        </button>
      </div>

      {/* Tap zones for mobile */}
      <div className="absolute inset-0 flex" style={{ zIndex: 5, pointerEvents: "auto" }}>
        <div className="w-1/3 h-full cursor-pointer" onClick={onPrev} />
        <div className="w-1/3 h-full" />
        <div className="w-1/3 h-full cursor-pointer" onClick={onNext} />
      </div>
    </motion.div>
  );
}

function NotEnoughData({ count }: { count: number }) {
  const remaining = Math.max(0, 7 - count);
  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
      </div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass rounded-3xl p-10 text-center max-w-sm w-full">
        <div className="text-6xl mb-6">🌱</div>
        <h2 className="font-display font-bold text-2xl mb-3">Almost there!</h2>
        <p className="text-white/50 mb-3">
          Your Wrapped needs at least 7 check-ins to generate insights.
        </p>
        <p className="text-white/70 font-display font-semibold text-lg mb-8">
          {count > 0 ? remaining + " more " + (remaining === 1 ? "day" : "days") + " to go" : "Start your first check-in"}
        </p>
        <div className="h-2 rounded-full mb-8" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div className="h-full rounded-full" initial={{ width: 0 }}
            animate={{ width: Math.min(100, (count / 7) * 100) + "%" }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ background: "linear-gradient(90deg, #7c3aed, #ec4899)" }} />
        </div>
        <div className="space-y-3">
          <Link href="/checkin" className="block w-full py-3.5 rounded-2xl font-display font-semibold text-center hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
            {count === 0 ? "Start first check-in →" : "Today's check-in →"}
          </Link>
          <Link href="/dashboard" className="block w-full py-3.5 rounded-2xl font-display font-semibold text-center text-white/50 hover:text-white/80 transition-colors">
            Back to dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function WrappedPage() {
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardIndex, setCardIndex] = useState(0);
  const [useDummy, setUseDummy] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/checkin");
        if (res.ok) {
          const data = await res.json();
          if (data.checkins?.length >= 7) {
            setCheckins(data.checkins);
          } else {
            setCheckins(data.checkins || []);
          }
        }
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const activeCheckins = useDummy ? generateDummyCheckins(DUMMY_USER_ID) : checkins;
  const stats = computeWeeklyStats(activeCheckins);
  const insights = generateInsights(activeCheckins, stats);

  const handleNext = () => setCardIndex(i => Math.min(i + 1, insights.length - 1));
  const handlePrev = () => setCardIndex(i => Math.max(0, i - 1));

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [insights.length]);

  if (loading) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading your Wrapped...</div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div>
        <NotEnoughData count={checkins.length} />
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button onClick={() => setUseDummy(true)}
            className="glass px-4 py-2 rounded-full text-xs text-white/40 hover:text-white/70 transition-colors">
            Preview with demo data
          </button>
        </div>
      </div>
    );
  }

  const current = insights[cardIndex];
  return (
    <AnimatePresence mode="wait">
      <InsightCard key={current.id} insight={current} onNext={handleNext} onPrev={handlePrev}
        isFirst={cardIndex === 0} isLast={cardIndex === insights.length - 1}
        index={cardIndex} total={insights.length} />
    </AnimatePresence>
  );
}
