import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const skill = searchParams.get('skill')
  const resolvedParam = searchParams.get('resolved')
  let studentId = searchParams.get('studentId')

  if (session.user.role === 'STUDENT') {
    const student = await db.student.findFirst({ where: { userId: session.user.id } })
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    studentId = student.id
  }

  if (!studentId) return NextResponse.json({ error: 'studentId required' }, { status: 400 })

  const entries = await db.errorEntry.findMany({
    where: {
      studentId,
      ...(skill && { skill }),
      ...(resolvedParam === 'true' && { resolved: true }),
      ...(resolvedParam === 'false' && { resolved: false }),
    },
    orderBy: [{ resolved: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const entry = await db.errorEntry.create({ data: body })
  return NextResponse.json(entry, { status: 201 })
}
