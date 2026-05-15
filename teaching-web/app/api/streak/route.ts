import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getStreakSummary, getTodayActivity } from '@/lib/gamification'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let studentId: string | null = null

  if (session.user.role === 'STUDENT') {
    const student = await db.student.findFirst({ where: { userId: session.user.id } })
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    studentId = student.id
  } else {
    // Teacher: ?studentId=...
    const { searchParams } = new URL(_req.url)
    studentId = searchParams.get('studentId')
    if (!studentId) return NextResponse.json({ error: 'studentId required' }, { status: 400 })
  }

  const [streak, today] = await Promise.all([
    getStreakSummary(studentId),
    getTodayActivity(studentId),
  ])

  return NextResponse.json({ streak, today })
}
