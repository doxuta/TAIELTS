import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'

const ROLES = ['ADMIN', 'TEACHER', 'STUDENT'] as const

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const nextRole = body?.role
  if (!nextRole || !(ROLES as readonly string[]).includes(nextRole)) {
    return NextResponse.json({ error: 'invalid role' }, { status: 400 })
  }

  const before = await db.user.findUnique({ where: { id: params.id } })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Prevent admin from demoting themself accidentally — explicit safeguard.
  if (before.id === session.user.id && nextRole !== 'ADMIN') {
    return NextResponse.json(
      { error: 'You cannot demote your own account. Ask another admin.' },
      { status: 422 }
    )
  }

  // Guard against removing the last ADMIN.
  if (before.role === 'ADMIN' && nextRole !== 'ADMIN') {
    const adminCount = await db.user.count({ where: { role: 'ADMIN' } })
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot demote the last remaining ADMIN.' },
        { status: 422 }
      )
    }
  }

  const updated = await db.user.update({
    where: { id: params.id },
    data: { role: nextRole },
  })

  await writeAudit({
    actorId: session.user.id,
    action: 'USER_ROLE_CHANGE',
    entityType: 'USER',
    entityId: updated.id,
    before: { role: before.role },
    after: { role: updated.role },
  })

  return NextResponse.json({ id: updated.id, role: updated.role })
}
