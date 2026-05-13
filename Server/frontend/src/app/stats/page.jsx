'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { BarChart2 } from 'lucide-react'
import api from '@/lib/axios'

const cardStyle = {
  background: 'rgb(16,17,17)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: 'rgb(27,28,30) 0px 0px 0px 1px, rgb(7,8,10) 0px 0px 0px 1px inset',
}

function QueryCard({ title, description, columns, data, loading, index }) {
  return (
    <div className={`animate-fade-up-${Math.min(index + 1, 6)}`} style={cardStyle}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="text-sm font-semibold" style={{ color: '#f9f9f9', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{title}</h3>
        <p className="text-xs mt-0.5" style={{ color: '#6a6b6c', letterSpacing: '0.2px' }}>{description}</p>
      </div>
      {loading ? (
        <div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-5 py-3 flex gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-3 rounded animate-pulse flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
              ))}
            </div>
          ))}
        </div>
      ) : !data?.length ? (
        <p className="px-5 py-6 text-xs" style={{ color: '#6a6b6c' }}>No data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                {columns.map(c => (
                  <th key={c} className="px-5 py-2.5 text-left whitespace-nowrap font-medium"
                    style={{ color: '#6a6b6c', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="rc-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="px-5 py-3 whitespace-nowrap" style={{ color: 'rgba(249,249,249,0.75)' }}>
                      {typeof val === 'number' || (typeof val === 'string' && val.match(/^\$?[\d,]+(\.\d+)?$/))
                        ? <span style={{ color: '#f9f9f9', fontWeight: 500 }}>{val ?? '—'}</span>
                        : (val ?? '—')
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function StatsPage() {
  const { user } = useAuth()
  const [data, setData]         = useState({})
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!user) return
    api.get('/stats/queries/')
      .then(res => setData(res.data || {}))
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [user])

  const cards = [
    { key: 'budget_summary',      title: 'Budget Summary',       description: 'Budget allocated vs total spent per film',      columns: ['Film','Status','Budget','Spent','Remaining'] },
    { key: 'over_budget',         title: 'Over-Budget Films',    description: 'Films where expenses exceed allocated budget',   columns: ['Film','Status','Budget','Spent','Overspend'] },
    { key: 'active_crew',         title: 'Most Active Crew',     description: 'Crew ranked by number of film assignments',     columns: ['Name','Job Title','Department','Films'] },
    { key: 'department_workload', title: 'Department Workload',  description: 'Film assignments per department',               columns: ['Department','Crew','Films Involved','Assignments'] },
    { key: 'uncrewed_films',      title: 'Films With No Crew',   description: 'Films with no crew members assigned yet',       columns: ['Film','Status','Start Date','Created By'] },
    { key: 'expense_breakdown',   title: 'Expense Breakdown',    description: 'Expenses grouped by film and category',         columns: ['Film','Category','Count','Total','Avg'] },
  ]

  return (
    <div className="space-y-8 animate-fade-up">

      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 className="h-3.5 w-3.5" style={{ color: '#FF6363' }} />
          <p className="text-xs font-medium" style={{ color: '#FF6363', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Analytics</p>
        </div>
        <h1 className="font-display text-4xl tracking-widest" style={{ color: '#f9f9f9' }}>STATISTICS</h1>
        <p className="text-sm mt-1" style={{ color: '#6a6b6c', letterSpacing: '0.2px' }}>Live query results from the database</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <QueryCard
            key={card.key}
            title={card.title}
            description={card.description}
            columns={card.columns}
            data={data[card.key]}
            loading={fetching}
            index={i}
          />
        ))}
      </div>
    </div>
  )
}
