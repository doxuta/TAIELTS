import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const targetBand = searchParams.get('band')

  const tests = await db.mockTest.findMany({
    where: {
      isPublished: true,
      ...(targetBand && { targetBand: parseFloat(targetBand) }),
    },
    include: {
      parts: { select: { id: true, skill: true, partNumber: true, timeMinutes: true } },
      _count: { select: { attempts: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(tests)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const test = await db.mockTest.create({ data: body })
  return NextResponse.json(test, { status: 201 })
}
