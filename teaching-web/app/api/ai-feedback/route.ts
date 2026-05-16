import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

function isStaff(role?: string) {
  return role === 'ADMIN' || role === 'TEACHER'
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const teacherStatus = searchParams.get('teacherStatus')
  const userId = searchParams.get('userId')
  const where: Record<string, unknown> = {}
  if (teacherStatus) where.teacherStatus = teacherStatus

  if (isStaff(session.user.role)) {
    if (userId) where.userId = userId
  } else {
    // Students see only their own.
    where.userId = session.user.id
  }

  const list = await db.aIFeedback.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      user: { select: { name: true, email: true } },
      reviewedBy: { select: { name: true, email: true } },
    },
  })
  return NextResponse.json(list)
}
