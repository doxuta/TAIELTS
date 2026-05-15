import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { TeacherSidebar } from '@/components/layout/TeacherSidebar'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any)?.role !== 'TEACHER') {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-surface-secondary overflow-hidden">
      <TeacherSidebar
        teacherName={(session.user?.name ?? 'Matthew').split(' ')[0]}
        teacherEmail={session.user?.email ?? ''}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
