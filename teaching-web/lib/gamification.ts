/**
 * Gamification: XP, streak, daily activity tracking.
 * Inspired by Duolingo (streak as loss-aversion retention tool, XP as universal currency).
 */
import { db } from '@/lib/db'

export const XP_RULES = {
  VOCAB_REVIEW: 5,
  VOCAB_REVIEW_EASY: 7,
  LESSON_SESSION: 50,
  ASSIGNMENT_SUBMIT: 100,
  ASSIGNMENT_GRADED: 50,
  MOCK_TEST_COMPLETE: 500,
  DAILY_GOAL_BONUS: 50,
  STREAK_7: 200,
  STREAK_30: 1000,
  STREAK_100: 5000,
  STRATEGY_READ: 20,
  ESSAY_READ: 15,
  SPEAKING_PRACTICE: 80,
  BLOCK_COMPLETE: 30,
} as const

export const DAILY_GOAL = {
  vocabCards: 10,
  minutesStudied: 15,
}

/**
 * Levels are exponential: level N needs N*N*500 XP cumulative.
 * Level 1 = 0 XP, Level 2 = 500, Level 3 = 2000, Level 4 = 4500, ...
 */
export function xpToLevel(xp: number): number {
  if (xp < 500) return 1
  return Math.floor(Math.sqrt(xp / 500)) + 1
}

export function levelToXP(level: number): number {
  if (level <= 1) return 0
  return Math.pow(level - 1, 2) * 500
}

export function xpProgressInLevel(xp: number): { currentLevel: number; xpInLevel: number; xpForNext: number; percent: number } {
  const currentLevel = xpToLevel(xp)
  const floor = levelToXP(currentLevel)
  const ceiling = levelToXP(currentLevel + 1)
  const xpInLevel = xp - floor
  const xpForNext = ceiling - floor
  return {
    currentLevel,
    xpInLevel,
    xpForNext,
    percent: Math.min(100, (xpInLevel / xpForNext) * 100),
  }
}

function startOfUTCDay(d: Date): Date {
  const day = new Date(d)
  day.setUTCHours(0, 0, 0, 0)
  return day
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfUTCDay(b).getTime() - startOfUTCDay(a).getTime()) / 86_400_000)
}

/**
 * Award XP for an activity. Updates streak + daily activity + records in StreakRecord.
 * Returns the updated streak record + delta info for UI.
 */
export async function awardXP(studentId: string, xpDelta: number, opts?: { vocabReviewed?: number; minutesStudied?: number }) {
  const now = new Date()
  const today = startOfUTCDay(now)

  // Get or create streak record
  let streak = await db.streakRecord.findUnique({ where: { studentId } })
  if (!streak) {
    streak = await db.streakRecord.create({
      data: { studentId, currentStreak: 0, longestStreak: 0, totalXP: 0, freezeCount: 2 },
    })
  }

  let newStreak = streak.currentStreak
  let streakChanged = false
  let bonusXP = 0
  let freezeUsed = false

  // Streak logic
  if (streak.lastActivityDate) {
    const lastDay = startOfUTCDay(streak.lastActivityDate)
    const gap = daysBetween(lastDay, today)

    if (gap === 0) {
      // Same day — no streak change
    } else if (gap === 1) {
      // Consecutive day — streak +1
      newStreak += 1
      streakChanged = true
    } else if (gap === 2 && streak.freezeCount > 0) {
      // Missed 1 day — use freeze, keep streak
      await db.streakRecord.update({
        where: { studentId },
        data: { freezeCount: { decrement: 1 }, freezesUsedThisMonth: { increment: 1 } },
      })
      freezeUsed = true
    } else {
      // Streak broken
      newStreak = 1
      streakChanged = true
    }
  } else {
    // First ever activity
    newStreak = 1
    streakChanged = true
  }

  // Streak milestones
  if (streakChanged && newStreak === 7) bonusXP += XP_RULES.STREAK_7
  if (streakChanged && newStreak === 30) bonusXP += XP_RULES.STREAK_30
  if (streakChanged && newStreak === 100) bonusXP += XP_RULES.STREAK_100

  const totalAwarded = xpDelta + bonusXP
  const newTotalXP = streak.totalXP + totalAwarded
  const newLevel = xpToLevel(newTotalXP)

  // Update streak record
  const updatedStreak = await db.streakRecord.update({
    where: { studentId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(streak.longestStreak, newStreak),
      totalXP: newTotalXP,
      level: newLevel,
      lastActivityDate: now,
    },
  })

  // Upsert today's activity row
  const activity = await db.dailyActivity.upsert({
    where: { studentId_date: { studentId, date: today } },
    create: {
      studentId,
      date: today,
      xpEarned: totalAwarded,
      vocabReviewed: opts?.vocabReviewed ?? 0,
      minutesStudied: opts?.minutesStudied ?? 0,
      goalMet: false,
    },
    update: {
      xpEarned: { increment: totalAwarded },
      vocabReviewed: { increment: opts?.vocabReviewed ?? 0 },
      minutesStudied: { increment: opts?.minutesStudied ?? 0 },
    },
  })

  // Check daily goal
  const goalMet = activity.vocabReviewed >= DAILY_GOAL.vocabCards && activity.minutesStudied >= DAILY_GOAL.minutesStudied
  if (goalMet && !activity.goalMet) {
    // Award daily goal bonus
    await db.dailyActivity.update({
      where: { id: activity.id },
      data: { goalMet: true, xpEarned: { increment: XP_RULES.DAILY_GOAL_BONUS } },
    })
    await db.streakRecord.update({
      where: { studentId },
      data: { totalXP: { increment: XP_RULES.DAILY_GOAL_BONUS } },
    })
  }

  return {
    streak: updatedStreak,
    xpAwarded: totalAwarded,
    bonusXP,
    levelUp: newLevel > streak.level,
    streakChanged,
    freezeUsed,
    goalJustMet: goalMet && !activity.goalMet,
  }
}

export async function getStreakSummary(studentId: string) {
  const streak = await db.streakRecord.findUnique({ where: { studentId } })
  if (!streak) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalXP: 0,
      level: 1,
      freezeCount: 2,
      ...xpProgressInLevel(0),
    }
  }
  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    totalXP: streak.totalXP,
    level: streak.level,
    freezeCount: streak.freezeCount,
    lastActivityDate: streak.lastActivityDate,
    ...xpProgressInLevel(streak.totalXP),
  }
}

export async function getTodayActivity(studentId: string) {
  const today = startOfUTCDay(new Date())
  const activity = await db.dailyActivity.findUnique({
    where: { studentId_date: { studentId, date: today } },
  })
  return (
    activity ?? {
      xpEarned: 0,
      vocabReviewed: 0,
      minutesStudied: 0,
      goalMet: false,
    }
  )
}
