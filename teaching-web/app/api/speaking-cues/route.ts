import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const part = searchParams.get('part')
  const random = searchParams.get('random') === '1'

  const cues = await db.speakingCueCard.findMany({
    where: part ? { part: parseInt(part) } : undefined,
    orderBy: [{ part: 'asc' }, { topic: 'asc' }],
  })

  if (random && cues.length > 0) {
    return NextResponse.json(cues[Math.floor(Math.random() * cues.length)])
  }

  return NextResponse.json(cues)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const cue = await db.speakingCueCard.create({ data: body })
  return NextResponse.json(cue, { status: 201 })
}
