import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const lesson = await db.lessonPlan.create({
    data: {
      title: body.title,
      sessionNumber: body.sessionNumber ?? 1,
      sessionType: body.sessionType,
      week: body.week,
      month: body.month,
      grammarTopic: body.grammarTopic || null,
      vocabularyFocus: body.vocabularyFocus || null,
      listeningFocus: body.listeningFocus || null,
      speakingFocus: body.speakingFocus || null,
      readingFocus: body.readingFocus || null,
      writingFocus: body.writingFocus || null,
      mainContent: body.mainContent || null,
      homework: body.homework || null,
      notes: body.notes || null,
      status: body.status ?? 'DRAFT',
      createdById: session.user.id,
    },
  })

  return NextResponse.json(lesson)
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const lessons = await db.lessonPlan.findMany({
    where: { createdById: session.user.id },
    orderBy: [{ month: 'desc' }, { week: 'desc' }],
  })

  return NextResponse.json(lessons)
}
