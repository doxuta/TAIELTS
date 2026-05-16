import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { buildTodayPlan } from '@/lib/todayPlan'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Only students have a Today Plan' }, { status: 403 })
  }

  const student = await db.student.findUnique({ where: { userId: session.user.id } })
  if (!student) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })

  const items = await buildTodayPlan(student.id)

  const blockIds = items.map((i) => i.blockId)
  const citations = blockIds.length
    ? await db.citation.findMany({
        where: { attachedToType: 'LESSON_BLOCK', attachedToId: { in: blockIds } },
        include: { sourceRoute: { include: { source: true } } },
      })
    : []

  return NextResponse.json({ items, citations })
}
