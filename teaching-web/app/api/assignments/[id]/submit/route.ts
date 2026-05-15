import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { submissionText } = body

  // Find student profile for this user
  const student = await db.student.findFirst({
    where: { userId: session.user.id },
  })
  if (!student) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })

  const submission = await db.studentAssignment.upsert({
    where: { studentId_assignmentId: { studentId: student.id, assignmentId: params.id } },
    create: {
      studentId: student.id,
      assignmentId: params.id,
      submissionText: submissionText || null,
      submittedAt: new Date(),
    },
    update: {
      submissionText: submissionText || null,
      submittedAt: new Date(),
    },
  })

  return NextResponse.json(submission, { status: 201 })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { studentId, score, feedback } = body

  const submission = await db.studentAssignment.update({
    where: { studentId_assignmentId: { studentId, assignmentId: params.id } },
    data: {
      score: score ?? undefined,
      feedback: feedback ?? undefined,
      gradedAt: new Date(),
    },
  })

  return NextResponse.json(submission)
}
