'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, Map, BookOpen, ClipboardList,
  BarChart3, BookMarked, Settings, LogOut, GraduationCap,
  ChevronRight, FileText, PenSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/teacher/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { href: '/teacher/students', icon: Users, label: 'Học viên' },
  { href: '/teacher/roadmap', icon: Map, label: 'Lộ trình' },
  { href: '/teacher/lessons', icon: BookOpen, label: 'Giáo án' },
  { href: '/teacher/sessions/new', icon: PenSquare, label: 'Ghi buổi học' },
  { href: '/teacher/assignments', icon: BookMarked, label: 'Bài tập & Test' },
  { href: '/teacher/rubrics', icon: BarChart3, label: 'Đánh giá tháng' },
  { href: '/teacher/progress', icon: ClipboardList, label: 'Tiến độ' },
  { href: '/teacher/reports', icon: FileText, label: 'Báo cáo' },
]

const BOTTOM_ITEMS = [
  { href: '/teacher/settings', icon: Settings, label: 'Cài đặt' },
]

interface SidebarProps {
  teacherName?: string
  teacherEmail?: string
}

export function TeacherSidebar({ teacherName = 'Matthew', teacherEmail }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] shrink-0 h-screen sticky top-0 bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <Link href="/teacher/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow">
            <GraduationCap className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-display font-semibold text-sidebar-accent-foreground leading-none tracking-tight">TAIELTS</p>
            <p className="text-[10px] text-sidebar-foreground/40 leading-none mt-0.5">Teacher Studio</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/30 font-medium px-2 mb-2">Quản lý</p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              className={cn('sidebar-link', isActive && 'active')}
            >
              <item.icon className="icon" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-40" />}
            </Link>
          )
        })}

        <div className="divider my-3" style={{ borderColor: 'rgba(255,255,255,0.04)' }} />

        {BOTTOM_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={cn('sidebar-link', isActive && 'active')}
            >
              <item.icon className="icon" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors group">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {teacherName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-accent-foreground truncate">{teacherName}</p>
            <p className="text-[10px] text-sidebar-foreground/40 truncate">Giáo viên</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-sidebar-foreground/40 hover:text-red-400"
            title="Đăng xuất"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
