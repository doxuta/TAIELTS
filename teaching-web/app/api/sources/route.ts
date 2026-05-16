import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'
import {
  SOURCE_TYPES,
  TRUST_LEVELS,
  LICENSE_STATUSES,
  REVIEW_STATUSES,
  isVisibleToStudents,
} from '@/lib/sources'

function isAdmin(role?: string) {
  return role === 'ADMIN'
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim()
  const type = searchParams.get('type')
  const reviewStatus = searchParams.get('reviewStatus')

  const where: Record<string, unknown> = {}
  if (type && (SOURCE_TYPES as readonly string[]).includes(type)) {
    where.type = type
  }
  if (reviewStatus && (REVIEW_STATUSES as readonly string[]).includes(reviewStatus)) {
    where.reviewStatus = reviewStatus
  }
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { provider: { contains: q } },
      { url: { contains: q } },
    ]
  }

  const role = session.user.role
  // Non-admin callers must never see sources that aren't visible to students.
  const sources = await db.source.findMany({
    where,
    orderBy: [{ updatedAt: 'desc' }],
    include: { routes: true },
  })

  const filtered = isAdmin(role)
    ? sources
    : sources.filter((s) => isVisibleToStudents(s.reviewStatus, s.trustLevel))

  return NextResponse.json(filtered)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body.title !== 'string' || !body.title.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }
  if (!body.type || !(SOURCE_TYPES as readonly string[]).includes(body.type)) {
    return NextResponse.json({ error: 'invalid type' }, { status: 400 })
  }

  const trustLevel = body.trustLevel && (TRUST_LEVELS as readonly string[]).includes(body.trustLevel)
    ? body.trustLevel
    : 'C_COMMUNITY'
  const licenseStatus =
    body.licenseStatus && (LICENSE_STATUSES as readonly string[]).includes(body.licenseStatus)
      ? body.licenseStatus
      : 'UNKNOWN'

  const source = await db.source.create({
    data: {
      type: body.type,
      title: body.title.trim(),
      provider: body.provider || null,
      author: body.author || null,
      url: body.url || null,
      description: body.description || null,
      trustLevel,
      licenseStatus,
      reviewStatus: 'DRAFT',
      cefrLevel: body.cefrLevel || null,
      targetBand: typeof body.targetBand === 'number' ? body.targetBand : null,
      skills: body.skills || null,
      topics: body.topics || null,
      createdById: session.user.id,
    },
  })

  await writeAudit({
    actorId: session.user.id,
    action: 'SOURCE_CREATE',
    entityType: 'SOURCE',
    entityId: source.id,
    after: source,
  })

  return NextResponse.json(source, { status: 201 })
}
