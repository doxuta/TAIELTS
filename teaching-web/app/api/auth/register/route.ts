import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

const VALID_LEVELS = ['NONE', 'A1', 'A2', 'B1', 'B2', 'C1_PLUS'] as const
type Level = (typeof VALID_LEVELS)[number]

const LEVEL_TO_MONTH: Record<Level, number> = {
  NONE: 1,
  A1: 1,
  A2: 3,
  B1: 5,
  B2: 8,
  C1_PLUS: 11,
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let body: {
    name?: string
    email?: string
    password?: string
    selfLevel?: string
    year1Goal?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name = body.name?.trim()
  const email = body.email?.trim().toLowerCase()
  const password = body.password
  const selfLevel = body.selfLevel as Level | undefined

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: 'Thiếu họ tên, email hoặc mật khẩu' },
      { status: 400 }
    )
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: 'Mật khẩu phải ít nhất 6 ký tự' },
      { status: 400 }
    )
  }
  if (!selfLevel || !VALID_LEVELS.includes(selfLevel)) {
    return NextResponse.json({ error: 'Trình độ không hợp lệ' }, { status: 400 })
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email đã được đăng ký' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const recommendedMonth = LEVEL_TO_MONTH[selfLevel]

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: name,
          selfLevel,
          year1Goal: body.year1Goal ?? null,
          currentMonth: recommendedMonth,
          currentWeek: 1,
          currentPhase: 'YEAR1_FOUNDATION',
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  return NextResponse.json(user, { status: 201 })
}
