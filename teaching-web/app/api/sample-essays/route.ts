import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const taskType = searchParams.get('taskType')
  const band = searchParams.get('band')

  const essays = await db.sampleEssay.findMany({
    where: {
      ...(taskType && { taskType }),
      ...(band && { band: parseFloat(band) }),
    },
    orderBy: [{ taskType: 'asc' }, { band: 'desc' }],
  })

  return NextResponse.json(essays)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const essay = await db.sampleEssay.create({ data: body })
  return NextResponse.json(essay, { status: 201 })
}
