import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const ALLOWED_STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'] as const

export async function PATCH(
  req: NextRequest,
  { params }: { params: { blockId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const student = await db.student.findUnique({ where: { userId: session.user.id } })
  if (!student) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })

  const body = await req.json().catch(() => null)
  const status = body?.status
  if (!status || !(ALLOWED_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 })
  }
  const minutesSpent = typeof body?.minutesSpent === 'number' ? body.minutesSpent : null

  // Find the active assignment for this block belonging to this student.
  const block = await db.lessonBlock.findUnique({
    where: { id: params.blockId },
    include: { module: true },
  })
  if (!block) return NextResponse.json({ error: 'Block not found' }, { status: 404 })

  const assignment = await db.moduleAssignment.findFirst({
    where: { studentId: student.id, moduleId: block.moduleId },
  })
  if (!assignment) {
    return NextResponse.json({ error: 'No assignment for this block' }, { status: 403 })
  }

  const progress = await db.moduleBlockProgress.upsert({
    where: { assignmentId_blockId: { assignmentId: assignment.id, blockId: block.id } },
    create: {
      assignmentId: assignment.id,
      blockId: block.id,
      status,
      completedAt: status === 'COMPLETED' ? new Date() : null,
      minutesSpent,
    },
    update: {
      status,
      completedAt: status === 'COMPLETED' ? new Date() : null,
      minutesSpent: minutesSpent ?? undefined,
    },
  })

  // If every block in the module is COMPLETED, mark the assignment COMPLETED.
  const totalBlocks = await db.lessonBlock.count({ where: { moduleId: block.moduleId } })
  const completedBlocks = await db.moduleBlockProgress.count({
    where: { assignmentId: assignment.id, status: 'COMPLETED' },
  })
  if (totalBlocks > 0 && completedBlocks >= totalBlocks && assignment.status === 'ACTIVE') {
    await db.moduleAssignment.update({
      where: { id: assignment.id },
      data: { status: 'COMPLETED' },
    })
  }

  return NextResponse.json(progress)
}
