import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

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
  if (!session || session.user.role !== 'TEACHER') {
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

  // SM-2 spaced repetition algorithm
  const card = await db.vocabCard.findUnique({ where: { id: cardId } })
  if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })

  let { interval, easeFactor, repetitions } = card

  if (rating < 2) {
    // Again / Hard — reset
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easeFactor)

    repetitions += 1
  }

  // Adjust ease factor: EF' = EF + (0.1 - (3-rating)*(0.08 + (3-rating)*0.02))
  easeFactor = Math.max(1.3, easeFactor + 0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02))

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + interval)

  const updated = await db.vocabCard.update({
    where: { id: cardId },
    data: { interval, easeFactor, repetitions, dueDate, lastReviewedAt: new Date() },
  })

  return NextResponse.json(updated)
}
