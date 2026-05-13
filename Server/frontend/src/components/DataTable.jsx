'use client'

import { Pencil, Trash2 } from 'lucide-react'

const tableStyles = {
  wrapper: {
    background: 'rgb(16,17,17)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: 'rgb(27,28,30) 0px 0px 0px 1px, rgb(7,8,10) 0px 0px 0px 1px inset',
  },
  th: {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '0.65rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#FF6363',
    fontWeight: 500,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
  },
  td: {
    padding: '12px 16px',
    fontSize: '0.875rem',
    color: 'rgba(249,249,249,0.85)',
  },
}

export default function DataTable({ columns, data, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div style={tableStyles.wrapper}>
        <table className="w-full">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={tableStyles.th}>{col.label}</th>
              ))}
              {(onEdit || onDelete) && <th style={tableStyles.th} />}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {columns.map(col => (
                  <td key={col.key} style={tableStyles.td}>
                    <div className="h-3 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', width: `${55 + (i * 7) % 35}%` }} />
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td style={tableStyles.td}>
                    <div className="h-3 w-10 rounded animate-pulse ml-auto" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ ...tableStyles.wrapper, padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '8px', opacity: 0.15 }}>—</div>
        <p style={{ fontSize: '0.875rem', color: '#6a6b6c', letterSpacing: '0.2px' }}>No records found.</p>
      </div>
    )
  }

  return (
    <div style={tableStyles.wrapper}>
      <table className="w-full">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={tableStyles.th}>{col.label}</th>
            ))}
            {(onEdit || onDelete) && (
              <th style={{ ...tableStyles.th, textAlign: 'right' }}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              className="rc-row group"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              {columns.map(col => (
                <td key={col.key} style={tableStyles.td}>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td style={{ ...tableStyles.td, textAlign: 'right' }}>
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg transition-opacity hover:opacity-60"
                        style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#9c9c9d', background: 'transparent' }}
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg transition-opacity hover:opacity-60"
                        style={{ border: '1px solid rgba(255,99,99,0.2)', color: '#FF6363', background: 'rgba(255,99,99,0.08)' }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
