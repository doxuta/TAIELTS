import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const studentId = searchParams.get('studentId')

  const sessions = await db.lessonSession.findMany({
    where: {
      student: { teacherId: session.user.id },
      ...(studentId && { studentId }),
    },
    include: { lessonPlan: { select: { title: true, sessionType: true } } },
    orderBy: { date: 'desc' },
    take: 50,
  })

  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const {
    studentId, lessonPlanId, sessionType, week, month, date,
    attended, quality, attitude, comprehension,
    noteForTeacher, errorLog, homework, homeworkDone,
    grammarDone, listeningDone, speakingDone, readingDone, writingDone, vocabDone,
  } = body

  // Verify student belongs to teacher
  const student = await db.student.findFirst({
    where: { id: studentId, teacherId: session.user.id },
  })
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const lessonSession = await db.lessonSession.create({
    data: {
      studentId,
      lessonPlanId: lessonPlanId || null,
      sessionType,
      week: week ?? student.currentWeek,
      month: month ?? student.currentMonth,
      date: new Date(date),
      attended: attended ?? false,
      quality: quality ?? null,
      attitude: attitude ?? null,
      comprehension: comprehension ?? null,
      noteForTeacher: noteForTeacher || null,
      errorLog: errorLog || null,
      homework: homework || null,
      homeworkDone: homeworkDone ?? null,
      grammarDone: grammarDone ?? false,
      listeningDone: listeningDone ?? false,
      speakingDone: speakingDone ?? false,
      readingDone: readingDone ?? false,
      writingDone: writingDone ?? false,
      vocabDone: vocabDone ?? false,
    },
  })

  // Update total sessions counter
  if (attended) {
    await db.student.update({
      where: { id: studentId },
      data: { totalSessions: { increment: 1 } },
    })
  }

  return NextResponse.json(lessonSession, { status: 201 })
}
