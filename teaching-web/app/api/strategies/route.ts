import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const skill = searchParams.get('skill')
  const band = searchParams.get('band')

  const strategies = await db.strategyArticle.findMany({
    where: {
      ...(skill && { skill }),
      ...(band && { band: parseFloat(band) }),
    },
    orderBy: [{ band: 'asc' }, { title: 'asc' }],
  })

  return NextResponse.json(strategies)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const article = await db.strategyArticle.create({ data: body })
  return NextResponse.json(article, { status: 201 })
}
