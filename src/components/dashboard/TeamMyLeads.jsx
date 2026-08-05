import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const GRADE_META = {
  Diamond: { bg:'#eff6ff', text:'#1d4ed8', border:'#bfdbfe', icon:'💎' },
  Silver:  { bg:'#f8fafc', text:'#475569', border:'#e2e8f0', icon:'🥈' },
  Bronze:  { bg:'#fffbeb', text:'#b45309', border:'#fde68a', icon:'🥉' },
  Ungraded:{ bg:'#f8fafc', text:'#94a3b8', border:'#e2e8f0', icon:'📋' },
}
const STATUS_META = {
  'New':        { bg:'#eff6ff', text:'#2563eb', border:'#bfdbfe' },
  'Assigned':   { bg:'#fffbeb', text:'#d97706', border:'#fde68a' },
  'In Progress':{ bg:'#f5f3ff', text:'#7c3aed', border:'#ddd6fe' },
  'Converted':  { bg:'#f0fdf4', text:'#059669', border:'#a7f3d0' },
  'Lost':       { bg:'#fff1f2', text:'#dc2626', border:'#fecaca' },
}
const SOURCE_ICONS = {
  Facebook:'📘', Instagram:'📸', Website:'🌐', Referral:'🤝',
  'Walk-in':'🚶', WhatsApp:'💬', LinkedIn:'💼', Other:'📌',
}
const STATUSES = ['New','Assigned','In Progress','Converted','Lost']

export default function TeamMyLeads({ onScheduleMeeting }) {
  const [leads,     setLeads]    = useState([])
  const [loading,   setLoading]  = useState(true)
  const [search,    setSearch]   = useState('')
  const [filterStatus, setFS]   = useState('')
  const [expanded,  setExpanded] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterStatus) params.status = filterStatus
      if (search)       params.search = search
      const { data } = await api.get('/team-members/my-leads', { params })
      setLeads(data)
    } catch {
      toast.error('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, search])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4 pb-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">My Leads</h2>
        <p className="text-sm text-gray-500">Leads assigned to you · {leads.length} total</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name or contact…"
          className="dp-input flex-1" />
        <select value={filterStatus} onChange={e => setFS(e.target.value)} className="dp-input bg-white sm:w-40">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        {(filterStatus || search) && (
          <button onClick={() => { setFS(''); setSearch('') }}
            className="dp-btn dp-btn-outline text-xs whitespace-nowrap">Clear ✕</button>
        )}
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {STATUSES.map(s => {
          const m   = STATUS_META[s]
          const cnt = leads.filter(l => l.status === s).length
          return (
            <button key={s} onClick={() => setFS(filterStatus === s ? '' : s)}
              className={`rounded-xl border p-2.5 text-center transition hover:shadow-md ${filterStatus === s ? 'ring-2 ring-blue-300' : ''}`}
              style={{ background: filterStatus === s ? m.bg : 'white', borderColor: filterStatus === s ? m.border : '#e5e7eb' }}>
              <p className="text-lg font-extrabold" style={{ color: m.text }}>{cnt}</p>
              <p className="text-[9px] text-gray-500 font-semibold leading-tight mt-0.5">{s}</p>
            </button>
          )
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />)}</div>
      ) : leads.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-blue-100 py-14 text-center">
          <p className="text-4xl mb-2">📋</p>
          <p className="font-bold text-gray-700">No leads assigned yet</p>
          <p className="text-sm text-gray-400 mt-1">Ask your admin to assign leads to you</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead, i) => {
            const gm  = GRADE_META[lead.grade] || GRADE_META.Ungraded
            const sm  = STATUS_META[lead.status] || {}
            const isEx = expanded === lead._id
            return (
              <motion.div key={lead._id} layout
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Left color accent */}
                <div className="flex items-stretch">
                  <div className="w-1 shrink-0 rounded-l-2xl" style={{ background: sm.text || '#94a3b8' }} />

                  <div className="flex-1 p-4">
                    {/* Top row */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl border"
                        style={{ background: gm.bg, borderColor: gm.border }}>
                        {gm.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <h3 className="font-extrabold text-gray-900 text-sm leading-tight">{lead.clientName}</h3>
                          <span className="dp-pill text-[10px] font-bold"
                            style={{ background: gm.bg, color: gm.text, border: `1px solid ${gm.border}` }}>
                            {gm.icon} {lead.grade}
                          </span>
                          <span className="dp-pill text-[10px] font-bold"
                            style={{ background: sm.bg, color: sm.text, border: `1px solid ${sm.border}` }}>
                            {lead.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                          <span>📞 {lead.contact}</span>
                          {lead.email && <span>✉️ {lead.email}</span>}
                          <span>{SOURCE_ICONS[lead.source] || '📌'} {lead.source}</span>
                        </div>
                        {lead.purpose && (
                          <p className="mt-1 text-xs text-gray-500 line-clamp-1">{lead.purpose}</p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button onClick={() => onScheduleMeeting && onScheduleMeeting(lead)}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold px-3 py-2 hover:bg-blue-700 transition">
                        📅 Schedule Meeting
                      </button>
                      <button onClick={() => setExpanded(isEx ? null : lead._id)}
                        className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-xs font-bold px-3 py-2 hover:bg-gray-100 transition">
                        {isEx ? '▲ Less' : '▼ Details'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isEx && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-2 border-t border-gray-100 bg-gray-50">
                        <div className="pt-3">
                          <p className="dp-label-text mb-1">Purpose / Interest</p>
                          <p className="text-sm text-gray-700">{lead.purpose || '—'}</p>
                        </div>
                        {lead.notes && (
                          <div>
                            <p className="dp-label-text mb-1">Notes</p>
                            <p className="text-sm text-gray-600">{lead.notes}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 pt-1">
                          Added {new Date(lead.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
