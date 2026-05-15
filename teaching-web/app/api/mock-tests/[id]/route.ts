import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const test = await db.mockTest.findUnique({
    where: { id: params.id },
    include: {
      parts: {
        orderBy: [{ skill: 'asc' }, { partNumber: 'asc' }],
        include: {
          questions: {
            orderBy: { questionNumber: 'asc' },
            select: {
              id: true, questionNumber: true, questionType: true,
              prompt: true, options: true, points: true,
              // correctAnswer omitted for students
              ...(session.user.role === 'TEACHER' && { correctAnswer: true, explanation: true }),
            },
          },
        },
      },
    },
  })

  if (!test) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(test)
}
