'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Plus, DollarSign } from 'lucide-react'
import api from '@/lib/axios'

const EMPTY_FORM  = { film_id: '', category: 'equipment', description: '', amount: '', expense_date: '' }
const CATEGORIES  = ['equipment','location','crew','post_production','marketing','other']

const CATEGORY_COLORS = {
  equipment:       { color: '#55b3ff', background: 'rgba(85,179,255,0.08)',   border: '1px solid rgba(85,179,255,0.2)' },
  location:        { color: '#5fc992', background: 'rgba(95,201,146,0.08)',   border: '1px solid rgba(95,201,146,0.2)' },
  crew:            { color: '#c084fc', background: 'rgba(192,132,252,0.08)',  border: '1px solid rgba(192,132,252,0.2)' },
  post_production: { color: '#ffbc33', background: 'rgba(255,188,51,0.08)',   border: '1px solid rgba(255,188,51,0.2)' },
  marketing:       { color: '#f472b6', background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.2)' },
  other:           { color: '#9c9c9d', background: 'rgba(156,156,157,0.08)', border: '1px solid rgba(156,156,157,0.2)' },
}

const labelStyle = { color: '#9c9c9d', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }

export default function ExpensesPage() {
  const { user, isAccountant } = useAuth()
  const [expenses, setExpenses]     = useState([])
  const [films, setFilms]           = useState([])
  const [fetching, setFetching]     = useState(true)
  const [error, setError]           = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)

  const fetchAll = () => {
    setFetching(true)
    Promise.all([api.get('/api/expenses/'), api.get('/api/films/')])
      .then(([e, f]) => { setExpenses(e.data?.results || e.data || []); setFilms(f.data?.results || f.data || []) })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setFetching(false))
  }
  useEffect(() => { if (user) fetchAll() }, [user])

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit   = (e) => {
    setEditTarget(e)
    setForm({ film_id: e.film_id, category: e.category, description: e.description || '', amount: e.amount, expense_date: e.expense_date })
    setModalOpen(true)
  }
  const handleDelete = async (e) => {
    if (!confirm('Delete this expense?')) return
    await api.delete(`/api/expenses/${e.expense_id}/`).catch(() => setError('Delete failed.'))
    fetchAll()
  }
  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      editTarget ? await api.put(`/api/expenses/${editTarget.expense_id}/`, form) : await api.post('/api/expenses/', form)
      setModalOpen(false); fetchAll()
    } catch (err) {
      const d = err.response?.data
      setError(d ? Object.values(d).flat().join(' ') : 'Save failed.')
    } finally { setSaving(false) }
  }

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)

  const columns = [
    { key: 'film_title',  label: 'Film' },
    { key: 'category',    label: 'Category', render: v => (
      <span className="status-pill" style={CATEGORY_COLORS[v] || CATEGORY_COLORS.other}>
        {v.replace('_', ' ')}
      </span>
    )},
    { key: 'description', label: 'Description' },
    { key: 'amount',      label: 'Amount', render: v => (
      <span className="font-medium" style={{ color: '#f9f9f9' }}>${Number(v).toLocaleString()}</span>
    )},
    { key: 'expense_date',     label: 'Date' },
    { key: 'recorded_by_name', label: 'Recorded By' },
  ]

  const selectContentStyle = { background: 'rgb(16,17,17)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }

  return (
    <div className="space-y-8 animate-fade-up">

      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-3.5 w-3.5" style={{ color: '#FF6363' }} />
            <p className="text-xs font-medium" style={{ color: '#FF6363', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Financials</p>
          </div>
          <h1 className="font-display text-4xl tracking-widest" style={{ color: '#f9f9f9' }}>EXPENSES</h1>
          <p className="text-sm mt-1" style={{ color: '#6a6b6c', letterSpacing: '0.2px' }}>
            {expenses.length} records ·{' '}
            <span style={{ color: '#5fc992', fontWeight: 500 }}>${total.toLocaleString()}</span> total
          </p>
        </div>
        {isAccountant() && (
          <button onClick={openCreate} className="rc-btn-secondary flex items-center gap-2 px-4 h-9 text-xs font-semibold" style={{ letterSpacing: '0.3px' }}>
            <Plus className="h-3.5 w-3.5" /> Record Expense
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2.5 text-xs rounded-lg px-4 py-3"
          style={{ color: '#FF6363', background: 'rgba(255,99,99,0.08)', border: '1px solid rgba(255,99,99,0.2)' }}>
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />{error}
        </div>
      )}

      <DataTable columns={columns} data={expenses} loading={fetching}
        onEdit={isAccountant() ? openEdit : null}
        onDelete={isAccountant() ? handleDelete : null} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Expense' : 'Record Expense'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label style={labelStyle}>Film *</label>
            <Select value={String(form.film_id)} onValueChange={v => setForm({ ...form, film_id: v })}>
              <SelectTrigger className="rc-input h-10 text-sm"><SelectValue placeholder="Select a film" /></SelectTrigger>
              <SelectContent style={selectContentStyle}>
                {films.map(f => <SelectItem key={f.film_id} value={String(f.film_id)}>{f.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Category *</label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger className="rc-input h-10 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent style={selectContentStyle}>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label style={labelStyle}>Amount ($) *</label>
              <input type="number" step="0.01" min="0" className="rc-input" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Date *</label>
            <input type="date" className="rc-input" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} required />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <input className="rc-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="flex-1 rc-btn-primary disabled:opacity-40"
              style={{ height: '40px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.3px' }}>
              {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Record'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="rc-btn-secondary px-4"
              style={{ height: '40px', fontSize: '0.875rem' }}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
