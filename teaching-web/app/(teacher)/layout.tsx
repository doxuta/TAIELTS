import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { TeacherShell } from '@/components/layout/TeacherShell'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any)?.role !== 'TEACHER') {
    redirect('/login')
  }

  return (
    <TeacherShell
      teacherName={(session.user?.name ?? 'Matthew').split(' ')[0]}
      teacherEmail={session.user?.email ?? ''}
    >
      {children}
    </TeacherShell>
  )
}
