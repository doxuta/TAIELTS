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
  const month = searchParams.get('month')

  const assignments = await db.assignment.findMany({
    where: {
      createdById: session.user.id,
      ...(month && { month: parseInt(month) }),
    },
    include: {
      submissions: {
        select: { studentId: true, submittedAt: true, score: true },
      },
    },
    orderBy: [{ month: 'desc' }, { week: 'desc' }],
  })

  return NextResponse.json(assignments)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, type, week, month, dueDate, partA, partB, partC, answerKey } = body

  const assignment = await db.assignment.create({
    data: {
      title,
      type,
      week: week ?? null,
      month,
      dueDate: dueDate ? new Date(dueDate) : null,
      partA: partA || null,
      partB: partB || null,
      partC: partC || null,
      answerKey: answerKey || null,
      createdById: session.user.id,
    },
  })

  return NextResponse.json(assignment, { status: 201 })
}
