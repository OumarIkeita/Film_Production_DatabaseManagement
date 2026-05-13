'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/axios'
import { Film, AlertCircle } from 'lucide-react'

const ROLES = [
  { value: 'crew_member', label: 'Crew Member' },
  { value: 'producer',    label: 'Producer' },
  { value: 'accountant',  label: 'Accountant' },
]

const labelStyle = { color: '#9c9c9d', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm]       = useState({ username: '', email: '', password: '', full_name: '', role: 'crew_member' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register/', form)
      router.push('/login')
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[92vh] flex items-center justify-center px-4 py-10">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full"
          style={{ background: 'rgba(255,99,99,0.04)', filter: 'blur(100px)' }} />
      </div>

      <div className="relative w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 mb-4"
            style={{ borderRadius: '10px', border: '1px solid rgba(255,99,99,0.3)', background: 'rgba(255,99,99,0.08)' }}>
            <Film className="h-5 w-5" style={{ color: '#FF6363' }} />
          </div>
          <h1 className="font-display text-4xl tracking-widest" style={{ color: '#f9f9f9' }}>
            CINE<span style={{ color: '#FF6363' }}>PROD</span>
          </h1>
          <p className="text-xs font-medium mt-1.5" style={{ color: '#6a6b6c', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Create Account
          </p>
        </div>

        <div style={{
          background: 'rgb(16,17,17)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'rgb(27,28,30) 0px 0px 0px 1px, rgb(7,8,10) 0px 0px 0px 1px inset, rgba(0,0,0,0.4) 0px 24px 48px',
        }}>
          <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="font-display text-xl tracking-widest" style={{ color: '#f9f9f9' }}>REGISTER</h2>
            <p className="text-xs mt-1" style={{ color: '#6a6b6c', letterSpacing: '0.2px' }}>Fill in your details to get started</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 text-xs rounded-lg px-3 py-2.5 mb-4"
              style={{ background: 'rgba(255,99,99,0.08)', border: '1px solid rgba(255,99,99,0.2)', color: '#FF6363' }}>
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', key: 'full_name', opts: { placeholder: 'John Doe', required: true } },
              { label: 'Username',  key: 'username',  opts: { placeholder: 'johndoe', required: true } },
              { label: 'Email',     key: 'email',     opts: { type: 'email', placeholder: 'john@cineprod.com', required: true } },
              { label: 'Password',  key: 'password',  opts: { type: 'password', placeholder: '••••••••', required: true } },
            ].map(({ label, key, opts }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input
                  {...opts}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="rc-input"
                />
              </div>
            ))}

            <div>
              <label style={labelStyle}>Role</label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="rc-input appearance-none"
                style={{ cursor: 'pointer' }}
              >
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 rc-btn-primary disabled:opacity-40"
              style={{ height: '40px', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.3px' }}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs mt-4" style={{ color: '#6a6b6c' }}>
            Already have an account?{' '}
            <Link href="/login" className="transition-opacity hover:opacity-60" style={{ color: '#FF6363' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
