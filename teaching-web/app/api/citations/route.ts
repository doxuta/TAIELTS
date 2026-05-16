import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'
import {
  CITATION_ATTACHED_TO_TYPES,
  CITATION_DISPLAY_MODES,
  isVisibleToStudents,
} from '@/lib/sources'

function canAttach(role?: string) {
  return role === 'ADMIN' || role === 'TEACHER'
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const attachedToType = searchParams.get('attachedToType')
  const attachedToId = searchParams.get('attachedToId')
  if (!attachedToType || !attachedToId) {
    return NextResponse.json(
      { error: 'attachedToType and attachedToId are required' },
      { status: 400 }
    )
  }

  const citations = await db.citation.findMany({
    where: { attachedToType, attachedToId },
    include: { sourceRoute: { include: { source: true } } },
    orderBy: { createdAt: 'asc' },
  })

  const role = session.user.role
  const visible = role === 'ADMIN' || role === 'TEACHER'
    ? citations
    : citations.filter((c) =>
        isVisibleToStudents(c.sourceRoute.source.reviewStatus, c.sourceRoute.source.trustLevel)
      )

  return NextResponse.json(visible)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !canAttach(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  if (!body.sourceRouteId || typeof body.sourceRouteId !== 'string') {
    return NextResponse.json({ error: 'sourceRouteId required' }, { status: 400 })
  }
  if (
    !body.attachedToType ||
    !(CITATION_ATTACHED_TO_TYPES as readonly string[]).includes(body.attachedToType)
  ) {
    return NextResponse.json({ error: 'invalid attachedToType' }, { status: 400 })
  }
  if (!body.attachedToId || typeof body.attachedToId !== 'string') {
    return NextResponse.json({ error: 'attachedToId required' }, { status: 400 })
  }

  const route = await db.sourceRoute.findUnique({
    where: { id: body.sourceRouteId },
    include: { source: true },
  })
  if (!route) return NextResponse.json({ error: 'Source route not found' }, { status: 404 })

  // Block attaching blocked/deprecated sources.
  if (route.source.reviewStatus === 'BLOCKED' || route.source.trustLevel === 'D_BLOCKED') {
    return NextResponse.json({ error: 'Cannot cite a blocked source' }, { status: 422 })
  }

  const displayMode =
    body.displayMode && (CITATION_DISPLAY_MODES as readonly string[]).includes(body.displayMode)
      ? body.displayMode
      : 'SOURCE_CARD'

  const citation = await db.citation.create({
    data: {
      sourceRouteId: route.id,
      attachedToType: body.attachedToType,
      attachedToId: body.attachedToId,
      claim: body.claim || null,
      confidence: typeof body.confidence === 'number' ? body.confidence : null,
      displayMode,
    },
  })

  await writeAudit({
    actorId: session.user.id,
    action: 'CITATION_ATTACH',
    entityType: 'CITATION',
    entityId: citation.id,
    after: citation,
  })

  return NextResponse.json(citation, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !canAttach(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const existing = await db.citation.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.citation.delete({ where: { id } })

  await writeAudit({
    actorId: session.user.id,
    action: 'CITATION_DETACH',
    entityType: 'CITATION',
    entityId: id,
    before: existing,
  })

  return NextResponse.json({ ok: true })
}
