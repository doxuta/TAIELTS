import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { studentId, week, month, year = 2026, sessionsCompleted, newWords, highlights, challenges, teacherNote } = body

  const student = await db.student.findFirst({
    where: { id: studentId, teacherId: session.user.id },
  })
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const progress = await db.weeklyProgress.upsert({
    where: { studentId_week_year: { studentId, week, year } },
    create: {
      studentId, week, month, year,
      sessionsCompleted: sessionsCompleted ?? 0,
      newWords: newWords ?? 0,
      highlights: highlights || null,
      challenges: challenges || null,
      teacherNote: teacherNote || null,
    },
    update: {
      sessionsCompleted: sessionsCompleted ?? undefined,
      newWords: newWords ?? undefined,
      highlights: highlights ?? undefined,
      challenges: challenges ?? undefined,
      teacherNote: teacherNote ?? undefined,
    },
  })

  return NextResponse.json(progress, { status: 201 })
}
