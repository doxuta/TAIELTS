'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'

interface Props {
  sidebar: React.ReactNode
  title: string
  subtitle?: string
  children: React.ReactNode
}

/**
 * Reusable responsive shell used by /admin and /builder. Renders the sidebar
 * statically on >= md screens and as a slide-over drawer on mobile.
 */
export function SidebarShell({ sidebar, title, subtitle, children }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-surface-secondary">
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:static md:translate-x-0 md:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {sidebar}
      </div>

      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-surface-primary border-b border-surface-border">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-md p-1.5 text-ink-secondary hover:bg-surface-tertiary"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <p className="text-sm font-semibold text-ink-primary leading-none">{title}</p>
            {subtitle && (
              <p className="text-[10px] text-ink-tertiary leading-none mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <main className="overflow-x-auto">{children}</main>
      </div>
    </div>
  )
}
