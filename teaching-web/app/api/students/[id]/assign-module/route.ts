import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'

function canAssign(role?: string) {
  return role === 'ADMIN' || role === 'TEACHER'
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !canAssign(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const student = await db.student.findUnique({ where: { id: params.id } })
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  // Teachers can only assign to their own students.
  if (session.user.role === 'TEACHER' && student.teacherId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.moduleId) {
    return NextResponse.json({ error: 'moduleId required' }, { status: 400 })
  }

  const module = await db.learningModule.findUnique({
    where: { id: body.moduleId },
    include: { _count: { select: { blocks: true } } },
  })
  if (!module) return NextResponse.json({ error: 'Module not found' }, { status: 404 })
  if (module.status !== 'PUBLISHED') {
    return NextResponse.json({ error: 'Module must be PUBLISHED' }, { status: 422 })
  }
  if (module._count.blocks === 0) {
    return NextResponse.json({ error: 'Module has no blocks' }, { status: 422 })
  }

  const existing = await db.moduleAssignment.findUnique({
    where: { studentId_moduleId: { studentId: student.id, moduleId: module.id } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Module already assigned to this student' }, { status: 409 })
  }

  const assignment = await db.moduleAssignment.create({
    data: {
      studentId: student.id,
      moduleId: module.id,
      assignedById: session.user.id,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      teacherNote: body.teacherNote || null,
    },
  })

  await writeAudit({
    actorId: session.user.id,
    action: 'MODULE_ASSIGN',
    entityType: 'MODULE_ASSIGNMENT',
    entityId: assignment.id,
    after: assignment,
  })

  return NextResponse.json(assignment, { status: 201 })
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const assignments = await db.moduleAssignment.findMany({
    where: { studentId: params.id },
    include: {
      module: { include: { _count: { select: { blocks: true } } } },
      blockProgress: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(assignments)
}
