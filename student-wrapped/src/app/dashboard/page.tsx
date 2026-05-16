"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import {
  buildChartData, buildHeatmapData, computeWeeklyStats,
  generateDummyCheckins, formatMinutes, computeWellnessScore
} from "@/lib/insights";
import { createClient } from "@/lib/supabase";
import type { CheckIn } from "@/types";

const DUMMY_USER_ID = "demo-user";

function StatCard({ emoji, label, value, sub, color }: { emoji: string; label: string; value: string; sub?: string; color: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="glass glass-hover rounded-2xl p-5">
      <div className="text-2xl mb-3">{emoji}</div>
      <div className="font-display font-bold text-2xl mb-0.5" style={{ color }}>{value}</div>
      <div className="text-white/40 text-xs font-medium uppercase tracking-wider">{label}</div>
      {sub && <div className="text-white/30 text-xs mt-1">{sub}</div>}
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs">
        <p className="text-white/60 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

function EmptyState({ profile }: { profile: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-10 text-center max-w-md mx-auto mt-10">
      <div className="text-6xl mb-6">🌱</div>
      <h2 className="font-display font-bold text-2xl mb-3">Your journey starts today</h2>
      <p className="text-white/50 mb-8 leading-relaxed">
        You have set your baseline. Now start logging daily check-ins — after 7 days your first real Wrapped will be ready.
      </p>
      {profile && (
        <div className="space-y-3 mb-8 text-left">
          {[
            { emoji: "🌙", label: "Sleep baseline", value: profile.baseline_sleep + "h", color: "#7c3aed" },
            { emoji: "🌊", label: "Stress baseline", value: profile.baseline_stress + "/10", color: "#ec4899" },
            { emoji: "📚", label: "Productivity baseline", value: profile.baseline_productivity + "/10", color: "#06b6d4" },
            { emoji: "🎯", label: "Workload baseline", value: profile.baseline_workload + "/10", color: "#10b981" },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2">
                <span>{item.emoji}</span>
                <span className="text-white/50 text-sm">{item.label}</span>
              </div>
              <span className="font-display font-semibold text-sm" style={{ color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
      <Link href="/checkin"
        className="block w-full py-4 rounded-2xl font-display font-semibold text-center hover:opacity-90 transition-opacity"
        style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
        Start first check-in →
      </Link>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const [{ data: checkinsData }, { data: profileData }] = await Promise.all([
              supabase.from("checkins").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(90),
              supabase.from("user_profiles").select("*").eq("user_id", user.id).single(),
            ]);
            setCheckins(checkinsData || []);
            setProfile(profileData);
            return;
          }
        }
        // Demo fallback
        setCheckins(generateDummyCheckins(DUMMY_USER_ID));
        setIsDemo(true);
      } catch {
        setCheckins(generateDummyCheckins(DUMMY_USER_ID));
        setIsDemo(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = computeWeeklyStats(checkins);
  const chartData = buildChartData(checkins);
  const heatmap = buildHeatmapData(checkins);
  const wellnessScore = computeWellnessScore(stats);
  const hasEnoughData = checkins.length >= 7;
  const hasAnyData = checkins.length > 0;

  const heatmapColors = [
    "rgba(255,255,255,0.05)",
    "rgba(124,58,237,0.35)",
    "rgba(124,58,237,0.6)",
    "rgba(124,58,237,0.8)",
    "rgba(124,58,237,1)",
  ];

  if (loading) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🎓</span>
          <span className="font-display font-semibold tracking-tight">
            Student <span className="gradient-text">Wrapped</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {hasEnoughData && (
            <Link href="/wrapped"
              className="glass glass-hover px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5">
              ✨ View Wrapped
            </Link>
          )}
          <Link href="/checkin"
            className="px-4 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
            + Check in
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display font-bold text-3xl md:text-4xl">Your Dashboard</h1>
            {stats.streakCount > 0 && (
              <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full text-sm">
                <span className="streak-fire">🔥</span>
                <span className="font-display font-semibold text-orange-400">{stats.streakCount}</span>
                <span className="text-white/40 text-xs">day streak</span>
              </div>
            )}
            {isDemo && (
              <div className="glass px-3 py-1.5 rounded-full text-xs text-white/40">Demo mode</div>
            )}
          </div>
          <p className="text-white/40">
            {hasAnyData
              ? checkins.length + " check-ins logged · " + (hasEnoughData ? "Wrapped ready ✨" : (7 - checkins.length) + " more days until Wrapped")
              : "No check-ins yet — start below"}
          </p>
        </motion.div>

        {/* No data state */}
        {!hasAnyData && !isDemo ? (
          <EmptyState profile={profile} />
        ) : (
          <>
            {hasEnoughData && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="mb-8 rounded-2xl p-5 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.2))", border: "1px solid rgba(124,58,237,0.3)" }}>
                <div>
                  <p className="font-display font-semibold text-lg">Your Weekly Wrapped is ready!</p>
                  <p className="text-white/50 text-sm">7 days of data. One beautiful story.</p>
                </div>
                <Link href="/wrapped" className="px-5 py-2.5 rounded-xl font-display font-semibold text-sm whitespace-nowrap"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  Open Wrapped →
                </Link>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <StatCard emoji="🌙" label="Avg Sleep" value={stats.avgSleep + "h"} sub={"Consistency " + stats.sleepConsistency + "%"} color="#7c3aed" />
              <StatCard emoji="🌊" label="Avg Stress" value={stats.avgStress + "/10"} sub={"Peak: " + stats.worstStressDay} color="#ec4899" />
              <StatCard emoji="📚" label="Study Total" value={formatMinutes(stats.avgStudyMinutes * checkins.length)}
                sub={"Avg " + formatMinutes(stats.avgStudyMinutes) + "/day"} color="#06b6d4" />
              <StatCard emoji="⚡" label="Avg Energy" value={stats.avgEnergy + "/10"} sub={"Peak: " + stats.peakEnergyDay} color="#f59e0b" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-semibold text-lg">Wellness Score</h3>
                  <p className="text-white/40 text-sm">Composite of all your tracked habits</p>
                </div>
                <div className="font-display font-bold text-4xl gradient-text">{wellnessScore}</div>
              </div>
              <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                  animate={{ width: wellnessScore + "%" }} transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  style={{ background: "linear-gradient(90deg, #7c3aed, #ec4899)" }} />
              </div>
              <div className="flex justify-between text-white/30 text-xs mt-2">
                <span>0</span><span>50</span><span>100</span>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-1">Sleep & Energy</h3>
                <p className="text-white/35 text-xs mb-5">Hours slept vs energy level</p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="sleep" stroke="#7c3aed" strokeWidth={2} fill="url(#sleepGrad)" name="Sleep (h)" dot={false} />
                    <Area type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} fill="url(#energyGrad)" name="Energy" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-1">Stress & Load</h3>
                <p className="text-white/35 text-xs mb-5">Stress level vs academic load</p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="stress" stroke="#ec4899" strokeWidth={2} dot={{ fill: "#ec4899", r: 3 }} name="Stress" />
                    <Line type="monotone" dataKey="load" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} name="Load" />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-1">Study Hours</h3>
                <p className="text-white/35 text-xs mb-5">Daily focused study time</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData}>
                    <defs>
                      <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#065f46" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="study" fill="url(#studyGrad)" radius={[4, 4, 0, 0]} name="Study (h)" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-1">Consistency Heatmap</h3>
                <p className="text-white/35 text-xs mb-5">Check-in activity over 12 weeks</p>
                <div className="flex gap-1 flex-wrap">
                  {heatmap.map((day, i) => (
                    <div key={i} title={day.date} className="heatmap-cell rounded-sm cursor-pointer"
                      style={{ background: heatmapColors[day.value], width: 12, height: 12 }} />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-white/30 text-xs">Less</span>
                  {heatmapColors.map((c, i) => (
                    <div key={i} className="rounded-sm" style={{ background: c, width: 10, height: 10 }} />
                  ))}
                  <span className="text-white/30 text-xs">More</span>
                </div>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-semibold">Ready for today's check-in?</h3>
                <p className="text-white/40 text-sm">45 seconds. That is all it takes.</p>
              </div>
              <Link href="/checkin" className="px-6 py-3 rounded-xl font-display font-semibold text-sm whitespace-nowrap transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                Start check-in →
              </Link>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}