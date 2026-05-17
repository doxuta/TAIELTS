'use client'

import {
  Shield,
  BookMarked,
  ClipboardList,
  LayoutDashboard,
  Users,
  Layers,
  GraduationCap,
  Sparkles,
} from 'lucide-react'
import { AppShell, type AppShellUser } from './AppShell'

export function AdminShell({
  user,
  children,
}: {
  user: AppShellUser
  children: React.ReactNode
}) {
  return (
    <AppShell
      brand={{
        name: 'TA Admin',
        subtitle: 'Source governance',
        icon: Shield,
        accent: 'violet',
      }}
      user={user}
      sections={[
        {
          label: 'Overview',
          items: [{ href: '/admin', label: 'Tổng quan', icon: LayoutDashboard }],
        },
        {
          label: 'Quản trị',
          items: [
            { href: '/admin/users', label: 'Users', icon: Users },
            { href: '/admin/sources', label: 'Sources', icon: BookMarked },
            { href: '/builder/modules', label: 'Modules', icon: Layers },
            { href: '/admin/audit', label: 'Audit log', icon: ClipboardList },
          ],
        },
        {
          label: 'Switch view',
          items: [
            {
              href: '/teacher/dashboard',
              label: 'Teacher Studio',
              icon: GraduationCap,
            },
            {
              href: '/teacher/feedback',
              label: 'AI feedback inbox',
              icon: Sparkles,
            },
          ],
        },
      ]}
    >
      {children}
    </AppShell>
  )
}
