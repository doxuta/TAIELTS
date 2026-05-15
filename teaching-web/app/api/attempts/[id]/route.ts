import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const attempt = await db.mockTestAttempt.findUnique({
    where: { id: params.id },
    include: {
      test: { include: { parts: { include: { questions: true } } } },
      answers: { include: { question: { select: { questionType: true, prompt: true, correctAnswer: true } } } },
    },
  })

  if (!attempt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Ownership check
  if (session.user.role === 'STUDENT') {
    const student = await db.student.findFirst({ where: { userId: session.user.id } })
    if (!student || attempt.studentId !== student.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  return NextResponse.json(attempt)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { answers } = await req.json() as { answers: { questionId: string; answer: string }[] }

  const student = await db.student.findFirst({ where: { userId: session.user.id } })
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const attempt = await db.mockTestAttempt.findUnique({ where: { id: params.id } })
  if (!attempt || attempt.studentId !== student.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Bulk upsert answers
  for (const a of answers) {
    await db.mockTestAnswer.upsert({
      where: { attemptId_questionId: { attemptId: params.id, questionId: a.questionId } },
      create: { attemptId: params.id, questionId: a.questionId, answer: a.answer },
      update: { answer: a.answer },
    })
  }

  return NextResponse.json({ ok: true, saved: answers.length })
}
