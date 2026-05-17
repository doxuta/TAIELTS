import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  // Student can only mark resolved
  const updateData = session.user.role === 'STUDENT'
    ? { resolved: body.resolved, resolvedAt: body.resolved ? new Date() : null }
    : body

  // Ownership check for student
  if (session.user.role === 'STUDENT') {
    const student = await db.student.findFirst({ where: { userId: session.user.id } })
    const entry = await db.errorEntry.findUnique({ where: { id: params.id } })
    if (!student || !entry || entry.studentId !== student.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const updated = await db.errorEntry.update({ where: { id: params.id }, data: updateData })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await db.errorEntry.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
