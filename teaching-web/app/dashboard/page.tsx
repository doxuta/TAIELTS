import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const role = (session.user as { role?: string })?.role

  if (role === 'ADMIN') redirect('/admin')
  if (role === 'TEACHER') redirect('/teacher/dashboard')
  if (role === 'STUDENT') redirect('/student/dashboard')

  // Unknown role — bounce to login.
  redirect('/login')
}
