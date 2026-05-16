import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'
import { BLOCK_TYPES_V1 } from '@/lib/modules'

function canBuild(role?: string) {
  return role === 'ADMIN' || role === 'TEACHER'
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !canBuild(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const module = await db.learningModule.findUnique({ where: { id: params.id } })
  if (!module) return NextResponse.json({ error: 'Module not found' }, { status: 404 })

  if (module.status === 'PUBLISHED' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admin can edit a published module' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  if (!body.type || !(BLOCK_TYPES_V1 as readonly string[]).includes(body.type)) {
    return NextResponse.json(
      { error: `Block type must be one of ${BLOCK_TYPES_V1.join(', ')} in v1` },
      { status: 400 }
    )
  }
  if (typeof body.title !== 'string' || !body.title.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  const last = await db.lessonBlock.findFirst({
    where: { moduleId: module.id },
    orderBy: { order: 'desc' },
  })
  const nextOrder = last ? last.order + 1 : 0

  const block = await db.lessonBlock.create({
    data: {
      moduleId: module.id,
      type: body.type,
      title: body.title.trim(),
      contentJson:
        body.content !== undefined && body.content !== null
          ? typeof body.content === 'string'
            ? body.content
            : JSON.stringify(body.content)
          : null,
      order: nextOrder,
      estimatedMinutes:
        typeof body.estimatedMinutes === 'number' ? body.estimatedMinutes : null,
    },
  })

  await writeAudit({
    actorId: session.user.id,
    action: 'BLOCK_CREATE',
    entityType: 'BLOCK',
    entityId: block.id,
    after: block,
  })

  return NextResponse.json(block, { status: 201 })
}
