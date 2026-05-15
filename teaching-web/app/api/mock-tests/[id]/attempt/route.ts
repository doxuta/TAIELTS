import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const student = await db.student.findFirst({ where: { userId: session.user.id } })
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const attempt = await db.mockTestAttempt.create({
    data: { studentId: student.id, testId: params.id },
  })

  return NextResponse.json(attempt, { status: 201 })
}
