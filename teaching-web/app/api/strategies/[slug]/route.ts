import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { awardXP, XP_RULES } from '@/lib/gamification'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const article = await db.strategyArticle.findUnique({ where: { slug: params.slug } })
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Award XP for students reading the article
  if (session.user.role === 'STUDENT') {
    const student = await db.student.findFirst({ where: { userId: session.user.id } })
    if (student) {
      // Only award once per article — check via a simple time-based check, or trust the FE to call POST /api/strategies/[slug]/read
      // For now, no XP on GET
    }
  }

  return NextResponse.json(article)
}

export async function POST(_req: NextRequest, { params }: { params: { slug: string } }) {
  // Mark as read + award XP (called explicitly from FE after user scrolls/reads)
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const student = await db.student.findFirst({ where: { userId: session.user.id } })
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const xp = await awardXP(student.id, XP_RULES.STRATEGY_READ, { minutesStudied: 5 })
  return NextResponse.json({ ok: true, xp })
}
