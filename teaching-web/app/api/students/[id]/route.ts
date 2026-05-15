import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const student = await db.student.findFirst({
    where: { id: params.id, teacherId: session.user.id },
    include: {
      user: { select: { name: true, email: true } },
      monthlyRubrics: { orderBy: { month: 'asc' } },
      weeklyProgress: { orderBy: { week: 'asc' } },
      lessonSessions: { orderBy: { date: 'desc' }, take: 20 },
    },
  })

  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(student)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const student = await db.student.updateMany({
    where: { id: params.id, teacherId: session.user.id },
    data: {
      ...(body.currentMonth !== undefined && { currentMonth: body.currentMonth }),
      ...(body.currentWeek !== undefined && { currentWeek: body.currentWeek }),
      ...(body.currentPhase !== undefined && { currentPhase: body.currentPhase }),
      ...(body.year1Goal !== undefined && { year1Goal: body.year1Goal }),
      ...(body.targetBand !== undefined && { targetBand: parseFloat(body.targetBand) }),
      ...(body.slackChannel !== undefined && { slackChannel: body.slackChannel }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.occupation !== undefined && { occupation: body.occupation }),
    },
  })

  return NextResponse.json(student)
}
