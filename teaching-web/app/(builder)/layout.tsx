import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BuilderShell } from '@/components/layout/BuilderShell'

export default async function BuilderLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string })?.role
  if (!session || (role !== 'ADMIN' && role !== 'TEACHER')) {
    redirect('/login')
  }

  return (
    <BuilderShell
      user={{
        name: session.user?.name ?? 'User',
        email: session.user?.email ?? '',
        role: role ?? 'TEACHER',
      }}
    >
      {children}
    </BuilderShell>
  )
}
