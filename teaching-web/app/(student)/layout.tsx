import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login')
  }

  // Student sidebar nav
  const studentNav = [
    { href: '/student/dashboard', label: 'Trang chủ' },
    { href: '/student/roadmap', label: 'Lộ trình' },
    { href: '/student/lessons', label: 'Giáo án' },
    { href: '/student/assignments', label: 'Bài tập' },
    { href: '/student/vocabulary', label: 'Từ vựng' },
    { href: '/student/reports', label: 'Báo cáo' },
  ]

  return (
    <div className="flex h-screen bg-surface-secondary overflow-hidden">
      {/* Student Sidebar */}
      <aside className="w-[220px] shrink-0 h-screen sticky top-0 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
              {session.user.name?.charAt(0) ?? 'H'}
            </div>
            <div>
              <p className="text-xs font-semibold text-sidebar-accent-foreground leading-none">{session.user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/40 mt-0.5">Học viên · Năm 1</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {studentNav.map(item => (
            <a key={item.href} href={item.href} className="sidebar-link">{item.label}</a>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
