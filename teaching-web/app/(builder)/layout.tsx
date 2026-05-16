import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { Hammer, Layers, LogOut } from 'lucide-react'
import { authOptions } from '@/lib/auth'

export default async function BuilderLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string })?.role
  if (!session || (role !== 'ADMIN' && role !== 'TEACHER')) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-surface-secondary">
      <aside className="hidden md:flex w-60 flex-col border-r border-surface-border bg-surface-primary">
        <div className="flex items-center gap-2 border-b border-surface-border px-4 py-4">
          <div className="rounded-md bg-gradient-to-br from-amber-500 to-orange-600 p-2 text-white">
            <Hammer className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-ink-primary">TA Builder</div>
            <div className="text-xs text-ink-tertiary">Modules & blocks</div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-1">
          <Link
            href="/builder/modules"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-primary hover:bg-surface-tertiary"
          >
            <Layers className="h-4 w-4" />
            Modules
          </Link>
        </nav>
        <div className="border-t border-surface-border px-4 py-3 text-xs text-ink-tertiary">
          <div className="font-medium text-ink-secondary">{session.user?.name ?? 'User'}</div>
          <div className="truncate">{session.user?.email}</div>
          <div className="mt-0.5 text-[10px] uppercase tracking-wide">{role}</div>
          <Link
            href="/api/auth/signout"
            className="mt-2 inline-flex items-center gap-1 text-ink-tertiary hover:text-ink-primary"
          >
            <LogOut className="h-3 w-3" /> Sign out
          </Link>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
