import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const email = body.email?.trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ error: 'Thiếu email' }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email } })

  // To avoid email enumeration, always return ok=true.
  // Only generate + log the token if the user actually exists.
  if (user) {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1h

    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    })

    const proto =
      req.headers.get('x-forwarded-proto') ?? 'http'
    const host = req.headers.get('host') ?? 'localhost:3001'
    const resetUrl = `${proto}://${host}/reset-password/${token}`

    // TODO: replace with real email service (Resend / SendGrid).
    // For now: log so dev can copy. Production needs proper email.
    console.log('\n[password-reset] Link cho', email, ':\n', resetUrl, '\n')
  }

  return NextResponse.json({
    ok: true,
    message:
      'Nếu email tồn tại trong hệ thống, link đặt lại mật khẩu đã được gửi. Hết hạn sau 1 giờ.',
  })
}
