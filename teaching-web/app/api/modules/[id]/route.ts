import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'
import { MODULE_SKILLS, isModuleVisibleToStudents } from '@/lib/modules'

function canBuild(role?: string) {
  return role === 'ADMIN' || role === 'TEACHER'
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const module = await db.learningModule.findUnique({
    where: { id: params.id },
    include: { blocks: { orderBy: { order: 'asc' } } },
  })
  if (!module) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!canBuild(session.user.role) && !isModuleVisibleToStudents(module.status)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(module)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !canBuild(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const before = await db.learningModule.findUnique({ where: { id: params.id } })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (before.status === 'PUBLISHED' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admin can edit a published module' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const data: Record<string, unknown> = {}
  if (typeof body.title === 'string') data.title = body.title.trim()
  if ('summary' in body) data.summary = body.summary || null
  if ('cefrLevel' in body) data.cefrLevel = body.cefrLevel || null
  if ('skill' in body) {
    data.skill = body.skill && (MODULE_SKILLS as readonly string[]).includes(body.skill)
      ? body.skill
      : null
  }
  if ('targetBand' in body) {
    data.targetBand = typeof body.targetBand === 'number' ? body.targetBand : null
  }
  if ('week' in body) data.week = typeof body.week === 'number' ? body.week : null
  if ('estimatedMinutes' in body) {
    data.estimatedMinutes = typeof body.estimatedMinutes === 'number' ? body.estimatedMinutes : null
  }

  const updated = await db.learningModule.update({ where: { id: params.id }, data })

  await writeAudit({
    actorId: session.user.id,
    action: 'MODULE_UPDATE',
    entityType: 'MODULE',
    entityId: updated.id,
    before,
    after: updated,
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const before = await db.learningModule.findUnique({ where: { id: params.id } })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.learningModule.delete({ where: { id: params.id } })

  await writeAudit({
    actorId: session.user.id,
    action: 'MODULE_DELETE',
    entityType: 'MODULE',
    entityId: before.id,
    before,
  })

  return NextResponse.json({ ok: true })
}
