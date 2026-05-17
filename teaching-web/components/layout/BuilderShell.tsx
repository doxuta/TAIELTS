'use client'

import {
  Hammer,
  Layers,
  LayoutDashboard,
  BookMarked,
  ClipboardList,
  Users,
  GraduationCap,
  Shield,
  Sparkles,
} from 'lucide-react'
import { AppShell, type AppShellUser, type NavSection } from './AppShell'

export function BuilderShell({
  user,
  children,
}: {
  user: AppShellUser
  children: React.ReactNode
}) {
  const isAdmin = user.role === 'ADMIN'

  const sections: NavSection[] = [
    {
      label: 'Builder',
      items: [{ href: '/builder/modules', label: 'Modules', icon: Layers }],
    },
  ]

  if (isAdmin) {
    sections.push({
      label: 'Switch to Admin',
      items: [
        { href: '/admin', label: 'Admin overview', icon: Shield },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/sources', label: 'Sources', icon: BookMarked },
        { href: '/admin/audit', label: 'Audit log', icon: ClipboardList },
      ],
    })
  }

  sections.push({
    label: 'Teacher Studio',
    items: [
      { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/teacher/feedback', label: 'AI feedback', icon: Sparkles },
      { href: '/teacher/students', label: 'Học viên', icon: GraduationCap },
    ],
  })

  return (
    <AppShell
      brand={{
        name: 'TA Builder',
        subtitle: 'Modules & blocks',
        icon: Hammer,
        accent: 'amber',
      }}
      user={user}
      sections={sections}
    >
      {children}
    </AppShell>
  )
}
