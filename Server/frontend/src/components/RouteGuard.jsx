'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const PUBLIC_ROUTES = ['/login', '/register']

export default function RouteGuard({ children }) {
  const { user, loading } = useAuth()
  const router   = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    const isPublic = PUBLIC_ROUTES.includes(pathname)
    if (!user && !isPublic) router.replace('/login')
    if (user && isPublic) router.replace('/')
  }, [user, loading, pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 rounded-sm border border-gold/30 bg-gold/5 flex items-center justify-center">
              <span className="font-display text-2xl text-gold tracking-widest">CP</span>
            </div>
            <div className="absolute inset-0 bg-gold/10 blur-xl rounded-full animate-pulse" />
          </div>
          <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase animate-pulse">
            Loading
          </p>
        </div>
      </div>
    )
  }

  const isPublic = PUBLIC_ROUTES.includes(pathname)
  if (!user && !isPublic) return null
  if (user && isPublic) return null

  return children
}
