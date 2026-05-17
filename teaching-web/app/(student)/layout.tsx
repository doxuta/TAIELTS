import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { StudentShell } from '@/components/layout/StudentShell'

export default async function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login')
  }

  return (
    <StudentShell
      user={{
        name: session.user.name ?? 'Học viên',
        email: session.user.email ?? '',
        role: session.user.role,
      }}
    >
      {children}
    </StudentShell>
  )
}
