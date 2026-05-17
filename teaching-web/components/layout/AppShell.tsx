'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Menu,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  badge?: string | number
}

export type NavSection = {
  label?: string
  items: NavItem[]
}

export type AppShellUser = {
  name: string
  email: string
  role: string
  initials?: string
}

interface AppShellProps {
  brand: {
    name: string
    subtitle?: string
    icon: LucideIcon
    accent?: 'violet' | 'amber' | 'sky' | 'emerald'
  }
  sections: NavSection[]
  user: AppShellUser
  children: React.ReactNode
  /** Optional secondary items at the bottom of the sidebar (e.g. Settings). */
  footerItems?: NavItem[]
}

const ACCENT_GRADIENT: Record<string, string> = {
  violet: 'from-violet-500 to-fuchsia-600',
  amber: 'from-amber-500 to-orange-600',
  sky: 'from-sky-500 to-indigo-600',
  emerald: 'from-emerald-500 to-teal-600',
}

export function AppShell({
  brand,
  sections,
  user,
  children,
  footerItems,
}: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const pathname = usePathname()

  const initials =
    user.initials ??
    (user.name
      .split(' ')
      .map((p) => p.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U')

  const accent = ACCENT_GRADIENT[brand.accent ?? 'violet']
  const BrandIcon = brand.icon

  const sidebarBody = (variant: 'desktop' | 'mobile') => {
    const isCollapsed = variant === 'desktop' && collapsed
    return (
      <div className="flex h-full flex-col bg-card border-r">
        {/* Brand */}
        <div
          className={cn(
            'flex h-14 items-center border-b px-3',
            isCollapsed && 'justify-center px-0'
          )}
        >
          <Link
            href="/"
            className={cn(
              'flex items-center gap-2.5 min-w-0',
              isCollapsed && 'justify-center'
            )}
          >
            <div
              className={cn(
                'h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br text-white flex items-center justify-center shadow',
                accent
              )}
            >
              <BrandIcon className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="text-sm font-semibold leading-none">{brand.name}</div>
                {brand.subtitle && (
                  <div className="text-[11px] text-muted-foreground leading-none mt-1 truncate">
                    {brand.subtitle}
                  </div>
                )}
              </div>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {sections.map((section, i) => (
            <div key={section.label ?? i}>
              {section.label && !isCollapsed && (
                <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {section.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      item={item}
                      isActive={isItemActive(pathname, item.href)}
                      collapsed={isCollapsed}
                      onClick={() => variant === 'mobile' && setMobileOpen(false)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer items */}
        {footerItems && footerItems.length > 0 && (
          <>
            <Separator />
            <div className="px-2 py-2 space-y-0.5">
              {footerItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={isItemActive(pathname, item.href)}
                  collapsed={isCollapsed}
                  onClick={() => variant === 'mobile' && setMobileOpen(false)}
                />
              ))}
            </div>
          </>
        )}

        {/* Collapse toggle (desktop only) */}
        {variant === 'desktop' && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed((c) => !c)}
              className="w-full justify-center text-muted-foreground"
            >
              {collapsed ? (
                <ChevronsRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronsLeft className="h-4 w-4" />
                  <span>Thu gọn</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            'hidden md:flex shrink-0 transition-all duration-200',
            collapsed ? 'w-16' : 'w-60'
          )}
        >
          {sidebarBody('desktop')}
        </aside>

        {/* Mobile sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            {sidebarBody('mobile')}
          </SheetContent>
        </Sheet>

        {/* Main column */}
        <div className="flex flex-1 min-w-0 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex-1 min-w-0">
              {/* Breadcrumb hook — pages can place their own header content via children */}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 gap-2 px-2 hover:bg-accent"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback
                      className={cn(
                        'bg-gradient-to-br text-white text-[10px]',
                        accent
                      )}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left leading-tight min-w-0">
                    <div className="text-xs font-medium truncate max-w-[140px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      {user.role}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-medium leading-none">{user.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {user.email}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/teacher/settings">
                    <Settings className="h-4 w-4" /> Cài đặt
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="flex-1 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  )
}

function isItemActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  if (pathname === href) return true
  return pathname.startsWith(href + '/')
}

function NavLink({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavItem
  isActive: boolean
  collapsed: boolean
  onClick?: () => void
}) {
  const Icon = item.icon
  const linkEl = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-accent text-foreground'
          : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
        collapsed && 'justify-center px-0'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge != null && (
            <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground px-1">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  )

  if (!collapsed) return linkEl
  return (
    <Tooltip>
      <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
      <TooltipContent side="right" className="font-medium">
        {item.label}
      </TooltipContent>
    </Tooltip>
  )
}
