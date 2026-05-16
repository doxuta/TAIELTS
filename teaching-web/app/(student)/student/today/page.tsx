'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Flame, Zap, Target, BookOpen, Mic, Award, Loader2, Sparkles } from 'lucide-react'
import { StreakBadge } from '@/components/ui/StreakBadge'
import { XPBar } from '@/components/ui/XPBar'
import { TodayPlan } from '@/components/student/TodayPlan'

const DAILY_TASKS = [
  { id: 'vocab', label: 'Ôn 10 thẻ từ vựng', icon: BookOpen, href: '/student/vocab', xp: 50 },
  { id: 'strategy', label: 'Đọc 1 bài chiến lược', icon: Target, href: '/student/strategies', xp: 20 },
  { id: 'speaking', label: 'Luyện 1 câu speaking', icon: Mic, href: '/student/speaking', xp: 80 },
  { id: 'mock', label: 'Làm 1 mock test (option)', icon: Award, href: '/student/mock-tests', xp: 500 },
]

export default function TodayChallengePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/streak').then(r => r.json()).then(d => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    )
  }

  const { streak, today } = data
  const goalProgress = Math.min(100, (today.vocabReviewed / 10) * 100)

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Hôm nay</h1>
        <p className="page-subtitle">{new Date().toLocaleDateString('vi', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* Top stats: streak + XP */}
      <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-up stagger-1">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-orange-500" />
            <p className="text-xs text-ink-tertiary uppercase tracking-wider">Chuỗi ngày học</p>
          </div>
          <StreakBadge currentStreak={streak.currentStreak} longestStreak={streak.longestStreak} freezeCount={streak.freezeCount} size="lg" />
        </div>
        <XPBar
          totalXP={streak.totalXP}
          level={streak.currentLevel}
          xpInLevel={streak.xpInLevel}
          xpForNext={streak.xpForNext}
          percent={streak.percent}
        />
      </div>

      {/* Daily goal */}
      <div className="card p-5 mb-6 animate-fade-up stagger-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-600" />
            <p className="text-sm font-semibold text-ink">Mục tiêu hôm nay</p>
          </div>
          {today.goalMet && <span className="text-xs font-bold text-emerald-600">✓ Hoàn thành!</span>}
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Ôn từ vựng</span><span className="font-mono tabular-nums">{today.vocabReviewed} / 10</span></div>
          <div className="h-2 bg-surface-border rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${goalProgress}%` }} />
          </div>
          <div className="flex justify-between mt-3"><span>Thời gian học</span><span className="font-mono tabular-nums">{today.minutesStudied} / 15 phút</span></div>
          <div className="h-2 bg-surface-border rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${Math.min(100, (today.minutesStudied / 15) * 100)}%` }} />
          </div>
        </div>
        {today.goalMet ? (
          <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 mt-3 inline-flex items-center gap-1">
            <Zap className="w-3 h-3" /> +50 XP bonus đã nhận
          </p>
        ) : (
          <p className="text-xs text-ink-tertiary mt-3">Hoàn thành cả 2 chỉ tiêu → +50 XP bonus + giữ chuỗi streak</p>
        )}
      </div>

      {/* Today Plan from assigned modules */}
      <div className="mb-6 animate-fade-up stagger-3">
        <h2 className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider mb-2 inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Lộ trình hôm nay
        </h2>
        <TodayPlan />
      </div>

      {/* Daily tasks */}
      <div className="space-y-2 animate-fade-up stagger-4">
        <h2 className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider mb-2">Hoạt động đề xuất</h2>
        {DAILY_TASKS.map(task => {
          const Icon = task.icon
          return (
            <Link key={task.id} href={task.href} className="card card-hover p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                <Icon className="w-4 h-4 text-brand-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{task.label}</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
                <Zap className="w-3 h-3" fill="currentColor" /> +{task.xp}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
