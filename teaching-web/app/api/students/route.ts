import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const students = await db.student.findMany({
    where: { teacherId: session.user.id },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(students)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { fullName, email, phone, dateOfBirth, occupation, slackChannel, targetBand, year1Goal } = body

  if (!fullName || !email) {
    return NextResponse.json({ error: 'Thiếu tên hoặc email' }, { status: 400 })
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email đã tồn tại' }, { status: 409 })
  }

  const tempPassword = await bcrypt.hash('ielts2026', 10)

  const user = await db.user.create({
    data: {
      name: fullName,
      email,
      password: tempPassword,
      role: 'STUDENT',
      studentProfile: {
        create: {
          teacherId: session.user.id,
          fullName,
          phone: phone || null,
          dateOfBirth: dateOfBirth || null,
          occupation: occupation || 'Sinh viên',
          slackChannel: slackChannel || null,
          targetBand: targetBand ? parseFloat(targetBand) : null,
          year1Goal: year1Goal || null,
        },
      },
    },
    include: { studentProfile: true },
  })

  return NextResponse.json(user, { status: 201 })
}
