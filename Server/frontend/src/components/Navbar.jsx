'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Film, Users, DollarSign, BarChart2, Shield, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react'

const STATUS_STYLES = {
  development:     'bg-zinc-800/60 text-zinc-300 border-zinc-600/40',
  pre_production:  'bg-amber-950/60 text-amber-300 border-amber-700/40',
  production:      'bg-blue-950/60 text-blue-300 border-blue-700/40',
  post_production: 'bg-purple-950/60 text-purple-300 border-purple-700/40',
  completed:       'bg-emerald-950/60 text-emerald-300 border-emerald-700/40',
  cancelled:       'bg-red-950/60 text-red-400 border-red-800/40',
}

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-zinc-800/60 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`status-pill border ${style}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

export default function Navbar() {
  const { user, logout, isAdmin, isProducer, isAccountant } = useAuth()
  const pathname = usePathname()
  const router   = useRouter()

  if (!user) return null

  const handleLogout = () => { logout(); router.push('/login') }

  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.username.slice(0, 2).toUpperCase()

  const navItems = [
    { href: '/',            label: 'Dashboard', icon: LayoutDashboard, show: true },
    { href: '/films',       label: 'Films',     icon: Film,            show: isProducer() },
    { href: '/crew',        label: 'Crew',      icon: Users,           show: isProducer() },
    { href: '/expenses',    label: 'Expenses',  icon: DollarSign,      show: isAccountant() },
    { href: '/stats',       label: 'Stats',     icon: BarChart2,       show: true },
    { href: '/admin/users', label: 'Users',     icon: Shield,          show: isAdmin() },
  ].filter(i => i.show)

  return (
    <nav className="rc-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-7">
            <Link href="/" className="flex items-center gap-2 group" style={{ transition: 'opacity 0.15s ease' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Film className="h-5 w-5" style={{ color: '#FF6363' }} />
              <span className="font-display text-2xl tracking-widest text-white">
                CINE<span style={{ color: '#FF6363' }}>PROD</span>
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-0.5">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== '/' && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-1.5 px-3.5 h-9 rounded-md text-sm font-medium"
                    style={{
                      color: active ? '#FF6363' : '#9c9c9d',
                      background: active ? 'rgba(255,99,99,0.1)' : 'transparent',
                      border: active ? '1px solid rgba(255,99,99,0.2)' : '1px solid transparent',
                      letterSpacing: '0.3px',
                      transition: 'opacity 0.15s ease, color 0.15s ease',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#f9f9f9' }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#9c9c9d' }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<div />}
              className="flex items-center gap-2 px-3 h-9 rounded-md outline-none cursor-pointer"
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <div className="h-6 w-6 rounded-md flex items-center justify-center text-xs font-semibold text-white"
                style={{ background: 'rgba(255,99,99,0.2)', border: '1px solid rgba(255,99,99,0.3)' }}>
                {initials}
              </div>
              <span className="text-xs hidden sm:block" style={{ color: '#9c9c9d', letterSpacing: '0.2px' }}>
                {user.full_name?.split(' ')[0] || user.username}
              </span>
              <ChevronDown className="h-3 w-3" style={{ color: '#6a6b6c' }} />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52 rounded-xl"
              style={{
                background: 'rgb(16,17,17)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'rgba(0,0,0,0.5) 0px 0px 0px 2px, rgba(255,255,255,0.19) 0px 0px 14px, rgba(0,0,0,0.5) 0px 16px 48px',
              }}>
              <div className="px-2 py-2.5">
                <p className="text-sm font-semibold text-white" style={{ letterSpacing: '0.1px' }}>
                  {user.full_name || user.username}
                </p>
                <p className="text-xs capitalize mt-0.5" style={{ color: '#9c9c9d', letterSpacing: '0.2px' }}>
                  {user.role?.replace('_', ' ')}
                </p>
              </div>
              <DropdownMenuSeparator style={{ background: 'rgba(255,255,255,0.06)' }} />
              <DropdownMenuItem
                onClick={handleLogout}
                className="gap-2 rounded-lg mx-1 my-0.5 px-2 py-2 text-sm cursor-pointer"
                style={{ color: '#FF6363', transition: 'opacity 0.15s ease' }}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex gap-0.5 px-4 pb-2 overflow-x-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md whitespace-nowrap font-medium"
              style={{
                color: active ? '#FF6363' : '#9c9c9d',
                background: active ? 'rgba(255,99,99,0.1)' : 'transparent',
                border: active ? '1px solid rgba(255,99,99,0.2)' : '1px solid transparent',
              }}
            >
              <Icon className="h-3 w-3" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
