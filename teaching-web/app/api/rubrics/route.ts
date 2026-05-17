import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const studentId = searchParams.get('studentId')

  const rubrics = await db.monthlyRubric.findMany({
    where: {
      student: { teacherId: session.user.id },
      ...(studentId && { studentId }),
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
  })

  return NextResponse.json(rubrics)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const {
    studentId, month, year = 2026,
    grammarScore, vocabularyScore, listeningScore, speakingScore, readingScore, writingScore,
    sessionsAttended, strongPoints, improvements, nextMonthFocus,
  } = body

  const student = await db.student.findFirst({
    where: { id: studentId, teacherId: session.user.id },
  })
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const rubric = await db.monthlyRubric.upsert({
    where: { studentId_month_year: { studentId, month, year } },
    create: {
      studentId, month, year,
      grammarScore: grammarScore ?? null,
      vocabularyScore: vocabularyScore ?? null,
      listeningScore: listeningScore ?? null,
      speakingScore: speakingScore ?? null,
      readingScore: readingScore ?? null,
      writingScore: writingScore ?? null,
      sessionsAttended: sessionsAttended ?? 0,
      strongPoints: strongPoints || null,
      improvements: improvements || null,
      nextMonthFocus: nextMonthFocus || null,
    },
    update: {
      grammarScore: grammarScore ?? undefined,
      vocabularyScore: vocabularyScore ?? undefined,
      listeningScore: listeningScore ?? undefined,
      speakingScore: speakingScore ?? undefined,
      readingScore: readingScore ?? undefined,
      writingScore: writingScore ?? undefined,
      sessionsAttended: sessionsAttended ?? undefined,
      strongPoints: strongPoints ?? undefined,
      improvements: improvements ?? undefined,
      nextMonthFocus: nextMonthFocus ?? undefined,
    },
  })

  return NextResponse.json(rubric, { status: 201 })
}
