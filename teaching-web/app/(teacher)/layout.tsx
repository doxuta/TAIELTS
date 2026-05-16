import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { TeacherShell } from '@/components/layout/TeacherShell'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  const role = (session?.user as { role?: string })?.role
  if (!session || (role !== 'TEACHER' && role !== 'ADMIN')) {
    redirect('/login')
  }

  return (
    <TeacherShell
      teacherName={(session.user?.name ?? 'Matthew').split(' ')[0]}
      teacherEmail={session.user?.email ?? ''}
      role={role}
    >
      {children}
    </TeacherShell>
  )
}
