import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const ROLES = ['ADMIN', 'TEACHER', 'STUDENT'] as const

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const role = searchParams.get('role')
  const q = searchParams.get('q')?.trim()
  const where: Record<string, unknown> = {}
  if (role && (ROLES as readonly string[]).includes(role)) where.role = role
  if (q) {
    where.OR = [{ name: { contains: q } }, { email: { contains: q } }]
  }

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      studentProfile: { select: { id: true, fullName: true } },
    },
  })
  return NextResponse.json(users)
}
