import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const lesson = await db.lessonPlan.findFirst({
    where: { id: params.id, createdById: session.user.id },
  })

  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(lesson)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const lesson = await db.lessonPlan.updateMany({
    where: { id: params.id, createdById: session.user.id },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.mainContent !== undefined && { mainContent: body.mainContent }),
      ...(body.homework !== undefined && { homework: body.homework }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  })

  return NextResponse.json(lesson)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await db.lessonPlan.deleteMany({
    where: { id: params.id, createdById: session.user.id },
  })

  return NextResponse.json({ ok: true })
}
