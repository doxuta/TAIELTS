import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AdminShell } from '@/components/layout/AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <AdminShell
      user={{
        name: session.user?.name ?? 'Admin',
        email: session.user?.email ?? '',
        role: 'ADMIN',
      }}
    >
      {children}
    </AdminShell>
  )
}
