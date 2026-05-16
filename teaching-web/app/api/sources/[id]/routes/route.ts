import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'
import { ROUTE_TYPES } from '@/lib/sources'

function isAdmin(role?: string) {
  return role === 'ADMIN'
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const source = await db.source.findUnique({ where: { id: params.id } })
  if (!source) return NextResponse.json({ error: 'Source not found' }, { status: 404 })

  const body = await req.json().catch(() => null)
  if (!body || typeof body.displayLabel !== 'string' || !body.displayLabel.trim()) {
    return NextResponse.json({ error: 'displayLabel is required' }, { status: 400 })
  }
  if (!body.routeType || !(ROUTE_TYPES as readonly string[]).includes(body.routeType)) {
    return NextResponse.json({ error: 'invalid routeType' }, { status: 400 })
  }

  let locatorJson: string | null = null
  if (body.locator !== undefined && body.locator !== null) {
    try {
      locatorJson = typeof body.locator === 'string' ? body.locator : JSON.stringify(body.locator)
    } catch {
      return NextResponse.json({ error: 'invalid locator' }, { status: 400 })
    }
  }

  const route = await db.sourceRoute.create({
    data: {
      sourceId: source.id,
      routeType: body.routeType,
      displayLabel: body.displayLabel.trim(),
      locatorJson,
      teacherNote: body.teacherNote || null,
      learnerInstruction: body.learnerInstruction || null,
    },
  })

  await writeAudit({
    actorId: session.user.id,
    action: 'SOURCE_ROUTE_CREATE',
    entityType: 'SOURCE_ROUTE',
    entityId: route.id,
    after: route,
  })

  return NextResponse.json(route, { status: 201 })
}
