'use client'

import { useState } from 'react'
import { Menu, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TeacherSidebar } from './TeacherSidebar'

interface TeacherShellProps {
  children: React.ReactNode
  teacherName?: string
  teacherEmail?: string
  role?: string
}

export function TeacherShell({ children, teacherName, teacherEmail, role }: TeacherShellProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:static md:translate-x-0 md:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <TeacherSidebar teacherName={teacherName} teacherEmail={teacherEmail} role={role} />
      </div>

      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-background/95 backdrop-blur border-b">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setOpen(true)}
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
              <GraduationCap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">TAIELTS</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
