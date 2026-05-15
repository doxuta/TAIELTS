import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  if (session.user.role === 'TEACHER') {
    redirect('/teacher/dashboard')
  }

  redirect('/student/dashboard')
}
