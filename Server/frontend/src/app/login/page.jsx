'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Film, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [form, setForm]         = useState({ username: '', password: '' })
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      router.push('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[92vh] flex items-center justify-center px-4">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full"
          style={{ background: 'rgba(255,99,99,0.04)', filter: 'blur(100px)' }} />
      </div>

      <div className="relative w-full max-w-sm animate-fade-up">

        {/* Logo lockup */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 mb-4 relative"
            style={{ borderRadius: '10px', border: '1px solid rgba(255,99,99,0.3)', background: 'rgba(255,99,99,0.08)' }}>
            <Film className="h-5 w-5" style={{ color: '#FF6363' }} />
          </div>
          <h1 className="font-display text-4xl tracking-widest" style={{ color: '#f9f9f9' }}>
            CINE<span style={{ color: '#FF6363' }}>PROD</span>
          </h1>
          <p className="text-xs font-medium mt-2" style={{ color: '#6a6b6c', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            Production Management
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'rgb(16,17,17)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'rgb(27,28,30) 0px 0px 0px 1px, rgb(7,8,10) 0px 0px 0px 1px inset, rgba(0,0,0,0.4) 0px 24px 48px',
        }}>
          <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="font-display text-xl tracking-widest" style={{ color: '#f9f9f9' }}>SIGN IN</h2>
            <p className="text-xs mt-1" style={{ color: '#6a6b6c', letterSpacing: '0.2px' }}>Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 text-xs rounded-lg px-3 py-2.5 mb-4"
              style={{ background: 'rgba(255,99,99,0.08)', border: '1px solid rgba(255,99,99,0.2)', color: '#FF6363' }}>
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: '#9c9c9d', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
                placeholder="e.g. admin_sara"
                className="rc-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: '#9c9c9d', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder="••••••••"
                  className="rc-input"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-60"
                  style={{ color: '#6a6b6c' }}
                >
                  {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 rc-btn-primary disabled:opacity-40"
              style={{ height: '40px', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.3px' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs mt-4" style={{ color: '#6a6b6c' }}>
            No account?{' '}
            <Link href="/register" className="transition-opacity hover:opacity-60" style={{ color: '#FF6363' }}>
              Register here
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: '#6a6b6c', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            {[
              ['admin_sara',  'admin123',    'Admin'],
              ['prod_james',  'producer123', 'Producer'],
              ['acc_ryan',    'acc123',      'Accountant'],
              ['crew_alex',   'crew123',     'Crew'],
            ].map(([u, p, role]) => (
              <button
                key={u}
                type="button"
                onClick={() => setForm({ username: u, password: p })}
                className="text-left transition-opacity hover:opacity-60"
              >
                <span style={{ color: '#f9f9f9', letterSpacing: '0.1px' }}>{u}</span>
                <span style={{ color: '#6a6b6c' }}> · {role}</span>
              </button>
            ))}
          </div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '8px' }}>Click to auto-fill</p>
        </div>

      </div>
    </div>
  )
}
