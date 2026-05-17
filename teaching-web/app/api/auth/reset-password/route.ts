import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  let body: { token?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const token = body.token?.trim()
  const password = body.password
  if (!token || !password) {
    return NextResponse.json({ error: 'Thiếu token hoặc mật khẩu' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: 'Mật khẩu phải ít nhất 6 ký tự' },
      { status: 400 }
    )
  }

  const record = await db.passwordResetToken.findUnique({ where: { token } })
  if (!record) {
    return NextResponse.json(
      { error: 'Link không hợp lệ.' },
      { status: 400 }
    )
  }
  if (record.usedAt) {
    return NextResponse.json(
      { error: 'Link đã được dùng. Vui lòng gửi yêu cầu mới.' },
      { status: 400 }
    )
  }
  if (record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'Link đã hết hạn. Vui lòng gửi yêu cầu mới.' },
      { status: 400 }
    )
  }

  const hashed = await bcrypt.hash(password, 10)

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { password: hashed },
    }),
    db.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ])

  return NextResponse.json({ ok: true })
}
