import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'
import {
  SOURCE_TYPES,
  TRUST_LEVELS,
  LICENSE_STATUSES,
  isVisibleToStudents,
} from '@/lib/sources'

function isAdmin(role?: string) {
  return role === 'ADMIN'
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const source = await db.source.findUnique({
    where: { id: params.id },
    include: { routes: { orderBy: { createdAt: 'asc' } } },
  })
  if (!source) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (!isAdmin(session.user.role) && !isVisibleToStudents(source.reviewStatus, source.trustLevel)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(source)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const before = await db.source.findUnique({ where: { id: params.id } })
  if (!before) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const data: Record<string, unknown> = {}
  if (typeof body.title === 'string') data.title = body.title.trim()
  if (body.type && (SOURCE_TYPES as readonly string[]).includes(body.type)) data.type = body.type
  if (body.trustLevel && (TRUST_LEVELS as readonly string[]).includes(body.trustLevel)) {
    data.trustLevel = body.trustLevel
  }
  if (body.licenseStatus && (LICENSE_STATUSES as readonly string[]).includes(body.licenseStatus)) {
    data.licenseStatus = body.licenseStatus
  }
  for (const key of ['provider', 'author', 'url', 'description', 'cefrLevel', 'skills', 'topics']) {
    if (key in body) data[key] = body[key] || null
  }
  if ('targetBand' in body) {
    data.targetBand = typeof body.targetBand === 'number' ? body.targetBand : null
  }
  if ('lastVerifiedAt' in body) {
    data.lastVerifiedAt = body.lastVerifiedAt ? new Date(body.lastVerifiedAt) : null
  }

  const updated = await db.source.update({ where: { id: params.id }, data })

  await writeAudit({
    actorId: session.user.id,
    action: 'SOURCE_UPDATE',
    entityType: 'SOURCE',
    entityId: updated.id,
    before,
    after: updated,
  })

  return NextResponse.json(updated)
}
