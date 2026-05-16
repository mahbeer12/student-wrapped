// Core data types for Student Wrapped

export interface CheckIn {
  id: string;
  user_id: string;
  date: string; // ISO date string YYYY-MM-DD
  sleep_hours: number;       // 0-12
  stress_level: number;      // 1-10
  study_minutes: number;     // 0-600
  academic_load: number;     // 0-10 (# of major tasks)
  energy_level: number;      // 1-10
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  streak_count: number;
  created_at: string;
}

export interface WeeklyStats {
  avgSleep: number;
  avgStress: number;
  avgStudyMinutes: number;
  avgAcademicLoad: number;
  avgEnergy: number;
  totalStudyHours: number;
  checkInCount: number;
  streakCount: number;
  sleepConsistency: number; // 0-100 score
  bestStudyDay: string;
  worstStressDay: string;
  peakEnergyDay: string;
}

export interface WrappedInsight {
  id: string;
  title: string;
  stat: string;
  description: string;
  emoji: string;
  gradient: string;
  type: 'sleep' | 'stress' | 'study' | 'energy' | 'load' | 'summary';
}

export interface HeatmapDay {
  date: string;
  value: number; // 0 = no data, 1-4 = intensity levels
  hasData: boolean;
}

export interface ChartDataPoint {
  date: string;
  day: string;
  sleep?: number;
  stress?: number;
  study?: number;
  energy?: number;
  load?: number;
}
