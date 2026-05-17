'use client'

import {
  Sparkles,
  Home,
  Sun,
  Award,
  BookOpen,
  Lightbulb,
  FileText,
  Mic,
  ClipboardList,
  AlertCircle,
  BookMarked,
  NotebookPen,
} from 'lucide-react'
import { AppShell, type AppShellUser } from './AppShell'

export function StudentShell({
  user,
  children,
}: {
  user: AppShellUser
  children: React.ReactNode
}) {
  return (
    <AppShell
      brand={{
        name: 'TA Hub',
        subtitle: 'Học viên · Năm 1',
        icon: Sparkles,
        accent: 'violet',
      }}
      user={user}
      sections={[
        {
          label: 'Trang chính',
          items: [
            { href: '/student/dashboard', label: 'Trang chủ', icon: Home },
            { href: '/student/today', label: 'Hôm nay', icon: Sun },
          ],
        },
        {
          label: 'Luyện kỹ năng',
          items: [
            { href: '/student/vocab', label: 'Flashcard', icon: BookOpen },
            { href: '/student/strategies', label: 'Chiến lược', icon: Lightbulb },
            { href: '/student/sample-essays', label: 'Sample Essays', icon: FileText },
            { href: '/student/speaking', label: 'Luyện Speaking', icon: Mic },
            { href: '/student/mock-tests', label: 'Mock Test', icon: Award },
          ],
        },
        {
          label: 'Lớp học',
          items: [
            { href: '/student/lessons', label: 'Buổi học', icon: BookMarked },
            { href: '/student/assignments', label: 'Bài tập', icon: ClipboardList },
            { href: '/student/feedback', label: 'AI feedback', icon: Sparkles },
            { href: '/student/errors', label: 'Sổ tay lỗi sai', icon: AlertCircle },
            { href: '/student/journal', label: 'Nhật ký', icon: NotebookPen },
          ],
        },
      ]}
    >
      {children}
    </AppShell>
  )
}
