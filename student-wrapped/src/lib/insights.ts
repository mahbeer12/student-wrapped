import { CheckIn, WeeklyStats, WrappedInsight } from '@/types'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Compute weekly statistics from an array of check-ins
 */
export function computeWeeklyStats(checkins: CheckIn[]): WeeklyStats {
  if (checkins.length === 0) {
    return {
      avgSleep: 0, avgStress: 0, avgStudyMinutes: 0,
      avgAcademicLoad: 0, avgEnergy: 0, totalStudyHours: 0,
      checkInCount: 0, streakCount: 0, sleepConsistency: 0,
      bestStudyDay: 'N/A', worstStressDay: 'N/A', peakEnergyDay: 'N/A',
    }
  }

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
  const maxBy = (key: keyof CheckIn) =>
    checkins.reduce((a, b) => ((a[key] as number) > (b[key] as number) ? a : b))
  const minBy = (key: keyof CheckIn) =>
    checkins.reduce((a, b) => ((a[key] as number) < (b[key] as number) ? a : b))

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr)
    return SHORT_DAYS[d.getDay()]
  }

  // Sleep consistency = 100 - (std dev of sleep * 15), clamped to 0-100
  const sleepVals = checkins.map(c => c.sleep_hours)
  const sleepMean = avg(sleepVals)
  const sleepStdDev = Math.sqrt(avg(sleepVals.map(v => Math.pow(v - sleepMean, 2))))
  const sleepConsistency = Math.max(0, Math.min(100, Math.round(100 - sleepStdDev * 15)))

  return {
    avgSleep: Math.round(avg(checkins.map(c => c.sleep_hours)) * 10) / 10,
    avgStress: Math.round(avg(checkins.map(c => c.stress_level)) * 10) / 10,
    avgStudyMinutes: Math.round(avg(checkins.map(c => c.study_minutes))),
    avgAcademicLoad: Math.round(avg(checkins.map(c => c.academic_load)) * 10) / 10,
    avgEnergy: Math.round(avg(checkins.map(c => c.energy_level)) * 10) / 10,
    totalStudyHours: Math.round(checkins.reduce((a, b) => a + b.study_minutes, 0) / 60 * 10) / 10,
    checkInCount: checkins.length,
    streakCount: computeStreak(checkins),
    sleepConsistency,
    bestStudyDay: getDayName(maxBy('study_minutes').date),
    worstStressDay: getDayName(maxBy('stress_level').date),
    peakEnergyDay: getDayName(maxBy('energy_level').date),
  }
}

/**
 * Compute current check-in streak
 */
export function computeStreak(checkins: CheckIn[]): number {
  if (checkins.length === 0) return 0
  
  const dates = checkins
    .map(c => c.date)
    .sort()
    .reverse()
  
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < dates.length; i++) {
    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)
    const expectedStr = expectedDate.toISOString().split('T')[0]
    
    if (dates[i] === expectedStr) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

/**
 * Generate personalized Wrapped insight cards from check-in data
 */
export function generateInsights(checkins: CheckIn[], stats: WeeklyStats): WrappedInsight[] {
  if (checkins.length < 3) return []

  const insights: WrappedInsight[] = []

  // 1. Opening summary card
  insights.push({
    id: 'summary',
    type: 'summary',
    emoji: '🎓',
    title: 'Your week in numbers',
    stat: `${stats.checkInCount} days tracked`,
    description: `You showed up ${stats.checkInCount} times this week. That's the kind of consistency that compounds.`,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
  })

  // 2. Sleep insight
  const sleepLabel = stats.avgSleep >= 8 ? 'a sleep champion' : stats.avgSleep >= 6.5 ? 'averaging solid rest' : 'running on fumes'
  insights.push({
    id: 'sleep',
    type: 'sleep',
    emoji: '🌙',
    title: 'Your sleep story',
    stat: `${stats.avgSleep}h average`,
    description: `You were ${sleepLabel} this week. Sleep consistency score: ${stats.sleepConsistency}/100.`,
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%)',
  })

  // 3. Study powerhouse
  const studyHoursFormatted = stats.totalStudyHours >= 1
    ? `${stats.totalStudyHours} hours`
    : `${Math.round(stats.totalStudyHours * 60)} minutes`
  insights.push({
    id: 'study',
    type: 'study',
    emoji: '📚',
    title: 'You put in the work',
    stat: studyHoursFormatted + ' studied',
    description: `Your best focus day was ${stats.bestStudyDay}. Average session: ${stats.avgStudyMinutes} min. Keep that momentum going.`,
    gradient: 'linear-gradient(135deg, #065f46 0%, #06b6d4 100%)',
  })

  // 4. Stress pattern
  const stressLabel = stats.avgStress <= 3 ? 'remarkably calm' : stats.avgStress <= 6 ? 'managing it well' : 'carrying a heavy load'
  insights.push({
    id: 'stress',
    type: 'stress',
    emoji: '🌊',
    title: 'Your stress landscape',
    stat: `${stats.avgStress}/10 avg stress`,
    description: `You were ${stressLabel} this week. Stress peaked on ${stats.worstStressDay} — noticed any patterns?`,
    gradient: 'linear-gradient(135deg, #7f1d1d 0%, #ec4899 100%)',
  })

  // 5. Energy & sleep correlation
  const highSleepDays = checkins.filter(c => c.sleep_hours >= 7)
  const lowSleepDays = checkins.filter(c => c.sleep_hours < 6)
  
  if (highSleepDays.length > 0 && lowSleepDays.length > 0) {
    const avgEnergyHighSleep = Math.round(highSleepDays.reduce((a, b) => a + b.energy_level, 0) / highSleepDays.length * 10) / 10
    const avgEnergyLowSleep = Math.round(lowSleepDays.reduce((a, b) => a + b.energy_level, 0) / lowSleepDays.length * 10) / 10
    const diff = Math.round((avgEnergyHighSleep - avgEnergyLowSleep) * 10) / 10
    
    insights.push({
      id: 'correlation',
      type: 'energy',
      emoji: '⚡',
      title: 'Sleep = Energy. Proven.',
      stat: `+${diff} energy points`,
      description: `On nights with 7+ hours of sleep, your energy was ${diff} points higher. Your data doesn't lie.`,
      gradient: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)',
    })
  } else {
    insights.push({
      id: 'energy',
      type: 'energy',
      emoji: '⚡',
      title: 'Your energy levels',
      stat: `${stats.avgEnergy}/10`,
      description: `Peak energy hit on ${stats.peakEnergyDay}. What made that day different? Worth replicating.`,
      gradient: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)',
    })
  }

  // 6. Workload insight
  const busyDays = checkins.filter(c => c.academic_load >= 4).length
  insights.push({
    id: 'load',
    type: 'load',
    emoji: '🎯',
    title: 'Your academic load',
    stat: `${busyDays} heavy days`,
    description: `You had ${busyDays} high-load days this week (4+ major tasks). Average load: ${stats.avgAcademicLoad} tasks/day.`,
    gradient: 'linear-gradient(135deg, #134e4a 0%, #10b981 100%)',
  })

  // 7. Closing motivational card
  const overallScore = computeWellnessScore(stats)
  const scoreLabel = overallScore >= 80 ? 'Thriving 🚀' : overallScore >= 60 ? 'Building Momentum 📈' : 'Room to Grow 🌱'
  insights.push({
    id: 'finale',
    type: 'summary',
    emoji: '✨',
    title: 'Your wellness score',
    stat: `${overallScore}/100`,
    description: `Status: ${scoreLabel}. Every check-in is an act of self-awareness. See you next week.`,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f59e0b 100%)',
  })

  return insights
}

/**
 * Compute a composite wellness score 0-100
 */
export function computeWellnessScore(stats: WeeklyStats): number {
  if (stats.checkInCount === 0) return 0

  const sleepScore = Math.min(100, (stats.avgSleep / 8) * 100)
  const stressScore = Math.max(0, ((10 - stats.avgStress) / 9) * 100)
  const studyScore = Math.min(100, (stats.avgStudyMinutes / 120) * 100)
  const energyScore = (stats.avgEnergy / 10) * 100
  const consistencyScore = (stats.checkInCount / 7) * 100

  return Math.round(
    sleepScore * 0.25 +
    stressScore * 0.25 +
    studyScore * 0.2 +
    energyScore * 0.15 +
    consistencyScore * 0.15
  )
}

/**
 * Format minutes into a human-readable string
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/**
 * Generate chart data from check-ins
 */
export function buildChartData(checkins: CheckIn[]) {
  return checkins
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(c => {
      const d = new Date(c.date)
      return {
        date: c.date,
        day: SHORT_DAYS[d.getDay()],
        sleep: c.sleep_hours,
        stress: c.stress_level,
        study: Math.round(c.study_minutes / 60 * 10) / 10, // convert to hours
        energy: c.energy_level,
        load: c.academic_load,
      }
    })
}

/**
 * Generate heatmap data for past 12 weeks
 */
export function buildHeatmapData(checkins: CheckIn[]): { date: string; value: number; hasData: boolean }[] {
  const today = new Date()
  const result = []
  const checkinDates = new Set(checkins.map(c => c.date))
  const studyByDate = Object.fromEntries(checkins.map(c => [c.date, c.study_minutes]))

  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const hasData = checkinDates.has(dateStr)
    const studyMins = studyByDate[dateStr] || 0
    
    let value = 0
    if (hasData) {
      if (studyMins >= 180) value = 4
      else if (studyMins >= 90) value = 3
      else if (studyMins >= 30) value = 2
      else value = 1
    }

    result.push({ date: dateStr, value, hasData })
  }

  return result
}

/**
 * Dummy data for development/demo
 */
export function generateDummyCheckins(userId: string): CheckIn[] {
  const checkins: CheckIn[] = []
  const today = new Date()

  const patterns = [
    { sleep: 7.5, stress: 4, study: 120, load: 3, energy: 7 },
    { sleep: 6, stress: 7, study: 180, load: 5, energy: 5 },
    { sleep: 8, stress: 3, study: 90, load: 2, energy: 8 },
    { sleep: 5.5, stress: 8, study: 240, load: 6, energy: 4 },
    { sleep: 7, stress: 5, study: 150, load: 4, energy: 6 },
    { sleep: 9, stress: 2, study: 60, load: 1, energy: 9 },
    { sleep: 6.5, stress: 6, study: 200, load: 5, energy: 6 },
  ]

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const pattern = patterns[6 - i]
    
    checkins.push({
      id: `dummy-${i}`,
      user_id: userId,
      date: d.toISOString().split('T')[0],
      sleep_hours: pattern.sleep,
      stress_level: pattern.stress,
      study_minutes: pattern.study,
      academic_load: pattern.load,
      energy_level: pattern.energy,
      created_at: d.toISOString(),
    })
  }

  return checkins
}
