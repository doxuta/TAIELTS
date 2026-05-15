'use client'

import { useState } from 'react'
import { Menu, X, GraduationCap } from 'lucide-react'
import { TeacherSidebar } from './TeacherSidebar'

interface TeacherShellProps {
  children: React.ReactNode
  teacherName?: string
  teacherEmail?: string
}

export function TeacherShell({ children, teacherName, teacherEmail }: TeacherShellProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen bg-surface-secondary overflow-hidden">
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — fixed on mobile, static on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:static md:translate-x-0 md:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <TeacherSidebar teacherName={teacherName} teacherEmail={teacherEmail} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-surface border-b border-surface-border">
          <button
            onClick={() => setOpen(true)}
            className="btn-icon"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <GraduationCap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-ink">Meridian</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
