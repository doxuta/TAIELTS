import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import {
  Shield,
  BookMarked,
  ClipboardList,
  LogOut,
  LayoutDashboard,
  Users,
  Layers,
  GraduationCap,
  Sparkles,
} from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { SidebarShell } from '@/components/layout/SidebarShell'

function AdminSidebar({ name, email }: { name?: string; email?: string }) {
  return (
    <aside className="flex w-60 flex-col h-screen border-r border-surface-border bg-surface-primary">
      <div className="flex items-center gap-2 border-b border-surface-border px-4 py-4">
        <div className="rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-600 p-2 text-white">
          <Shield className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-ink-primary">TA Admin</div>
          <div className="text-xs text-ink-tertiary">Source governance</div>
        </div>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        <Link
          href="/admin"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-primary hover:bg-surface-tertiary"
        >
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </Link>
        <Link
          href="/admin/users"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-primary hover:bg-surface-tertiary"
        >
          <Users className="h-4 w-4" />
          Users
        </Link>
        <Link
          href="/admin/sources"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-primary hover:bg-surface-tertiary"
        >
          <BookMarked className="h-4 w-4" />
          Sources
        </Link>
        <Link
          href="/builder/modules"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-primary hover:bg-surface-tertiary"
        >
          <Layers className="h-4 w-4" />
          Modules
        </Link>
        <Link
          href="/admin/audit"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-primary hover:bg-surface-tertiary"
        >
          <ClipboardList className="h-4 w-4" />
          Audit log
        </Link>

        <div className="my-2 border-t border-surface-border" />
        <p className="text-[10px] uppercase tracking-widest text-ink-tertiary font-medium px-3 mb-1">
          Switch view
        </p>
        <Link
          href="/teacher/dashboard"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-primary hover:bg-surface-tertiary"
        >
          <GraduationCap className="h-4 w-4" />
          Teacher Studio
        </Link>
        <Link
          href="/teacher/feedback"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-primary hover:bg-surface-tertiary"
        >
          <Sparkles className="h-4 w-4" />
          AI feedback inbox
        </Link>
      </nav>
      <div className="border-t border-surface-border px-4 py-3 text-xs text-ink-tertiary">
        <div className="font-medium text-ink-secondary">{name ?? 'Admin'}</div>
        <div className="truncate">{email}</div>
        <Link
          href="/api/auth/signout"
          className="mt-2 inline-flex items-center gap-1 text-ink-tertiary hover:text-ink-primary"
        >
          <LogOut className="h-3 w-3" /> Sign out
        </Link>
      </div>
    </aside>
  )
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <SidebarShell
      title="TA Admin"
      subtitle="Source governance"
      sidebar={<AdminSidebar name={session.user?.name ?? undefined} email={session.user?.email ?? undefined} />}
    >
      {children}
    </SidebarShell>
  )
}
