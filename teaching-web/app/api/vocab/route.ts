import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { scheduleReview, legacyRatingToFsrs } from '@/lib/srs'
import { awardXP, XP_RULES } from '@/lib/gamification'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Teachers can pass studentId; students get their own cards
  const { searchParams } = new URL(req.url)
  const studentId = searchParams.get('studentId')
  const dueOnly = searchParams.get('due') === '1'

  let targetStudentId = studentId

  if (session.user.role === 'STUDENT') {
    const student = await db.student.findFirst({ where: { userId: session.user.id } })
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    targetStudentId = student.id
  }

  if (!targetStudentId) return NextResponse.json({ error: 'studentId required' }, { status: 400 })

  const cards = await db.vocabCard.findMany({
    where: {
      studentId: targetStudentId,
      ...(dueOnly && { dueDate: { lte: new Date() } }),
    },
    orderBy: { dueDate: 'asc' },
  })

  return NextResponse.json(cards)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { studentId, word, definition, example, pronunciation, topic, week, month } = body

  const student = await db.student.findFirst({
    where: { id: studentId, teacherId: session.user.id },
  })
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const card = await db.vocabCard.upsert({
    where: { studentId_word: { studentId, word } },
    create: { studentId, word, definition, example, pronunciation, topic, week, month },
    update: { definition, example, pronunciation, topic },
  })

  return NextResponse.json(card, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { cardId, rating } = body // rating: 0=Again, 1=Hard, 2=Good, 3=Easy

  const card = await db.vocabCard.findUnique({ where: { id: cardId } })
  if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })

  // FSRS-6 scheduling (with SM-2 mirror for legacy UI)
  const fsrsRating = legacyRatingToFsrs(rating)
  const next = scheduleReview(card, fsrsRating)

  const updated = await db.vocabCard.update({
    where: { id: cardId },
    data: {
      interval: next.interval,
      easeFactor: next.easeFactor,
      repetitions: next.repetitions,
      dueDate: next.dueDate,
      lastReviewedAt: next.lastReviewedAt,
      stability: next.stability,
      difficulty: next.difficulty,
      state: next.state,
    },
  })

  // Award XP — only for students reviewing their own cards
  let xp = null
  if (session.user.role === 'STUDENT') {
    const student = await db.student.findFirst({ where: { userId: session.user.id } })
    if (student && card.studentId === student.id) {
      const xpAmount = rating >= 3 ? XP_RULES.VOCAB_REVIEW_EASY : XP_RULES.VOCAB_REVIEW
      xp = await awardXP(student.id, xpAmount, { vocabReviewed: 1, minutesStudied: 1 })
    }
  }

  return NextResponse.json({ card: updated, xp })
}
