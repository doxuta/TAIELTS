'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Flame, Zap, Target, BookOpen, Mic, Award, Loader2, Sparkles } from 'lucide-react'
import { StreakBadge } from '@/components/ui/StreakBadge'
import { XPBar } from '@/components/ui/XPBar'
import { TodayPlan } from '@/components/student/TodayPlan'
import { Card, CardContent } from '@/components/ui/card'

const DAILY_TASKS = [
  { id: 'vocab', label: 'Ôn 10 thẻ từ vựng', icon: BookOpen, href: '/student/vocab', xp: 50 },
  { id: 'strategy', label: 'Đọc 1 bài chiến lược', icon: Target, href: '/student/strategies', xp: 20 },
  { id: 'speaking', label: 'Luyện 1 câu speaking', icon: Mic, href: '/student/speaking', xp: 80 },
  { id: 'mock', label: 'Làm 1 mock test (option)', icon: Award, href: '/student/mock-tests', xp: 500 },
]

// Glassmorphism container & card classes — kept inline to allow per-page override
const GLASS_BG = 'min-h-full bg-gradient-to-br from-violet-500/10 via-background to-emerald-500/10'
const GLASS_CARD = 'bg-card/60 backdrop-blur-xl border-white/10 shadow-lg'

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
      <div className={GLASS_BG}>
        <div className="px-4 py-6 md:px-8 md:py-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  const { streak, today } = data
  const goalProgress = Math.min(100, (today.vocabReviewed / 10) * 100)

  return (
    <div className={GLASS_BG}>
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto space-y-5">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hôm nay</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString('vi', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className={GLASS_CARD}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-orange-500" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Chuỗi ngày học</p>
              </div>
              <StreakBadge
                currentStreak={streak.currentStreak}
                longestStreak={streak.longestStreak}
                freezeCount={streak.freezeCount}
                size="lg"
              />
            </CardContent>
          </Card>
          <XPBar
            totalXP={streak.totalXP}
            level={streak.currentLevel}
            xpInLevel={streak.xpInLevel}
            xpForNext={streak.xpForNext}
            percent={streak.percent}
          />
        </div>

        <Card className={GLASS_CARD}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold">Mục tiêu hôm nay</p>
              </div>
              {today.goalMet && <span className="text-xs font-bold text-emerald-500">✓ Hoàn thành!</span>}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Ôn từ vựng</span>
                <span className="font-mono tabular-nums">{today.vocabReviewed} / 10</span>
              </div>
              <div className="h-2 bg-border/50 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${goalProgress}%` }} />
              </div>
              <div className="flex justify-between mt-3">
                <span>Thời gian học</span>
                <span className="font-mono tabular-nums">{today.minutesStudied} / 15 phút</span>
              </div>
              <div className="h-2 bg-border/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.min(100, (today.minutesStudied / 15) * 100)}%` }}
                />
              </div>
            </div>
            {today.goalMet ? (
              <p className="text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-md px-3 py-2 mt-3 inline-flex items-center gap-1">
                <Zap className="w-3 h-3" /> +50 XP bonus đã nhận
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-3">
                Hoàn thành cả 2 chỉ tiêu → +50 XP bonus + giữ chuỗi streak
              </p>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Lộ trình hôm nay
          </h2>
          <TodayPlan />
        </div>

        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Hoạt động đề xuất
          </h2>
          {DAILY_TASKS.map(task => {
            const Icon = task.icon
            return (
              <Card key={task.id} className={`${GLASS_CARD} transition-transform hover:scale-[1.01]`}>
                <Link href={task.href}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-primary/15 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.label}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-500">
                      <Zap className="w-3 h-3" fill="currentColor" /> +{task.xp}
                    </span>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
