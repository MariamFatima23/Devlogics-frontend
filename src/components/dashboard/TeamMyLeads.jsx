import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const GRADE_COLORS = {
  Diamond: { bg:'rgba(147,197,253,0.2)', text:'#60a5fa', icon:'💎' },
  Silver:  { bg:'rgba(209,213,219,0.2)', text:'#d1d5db', icon:'🥈' },
  Bronze:  { bg:'rgba(251,191,36,0.15)', text:'#fbbf24', icon:'🥉' },
  Ungraded:{ bg:'rgba(255,255,255,0.05)', text:'rgba(255,255,255,0.4)', icon:'📋' },
}
const STATUS_COLORS = {
  'New':        { bg:'rgba(56,189,248,0.15)',  text:'#38bdf8' },
  'Assigned':   { bg:'rgba(251,191,36,0.15)',  text:'#fbbf24' },
  'In Progress':{ bg:'rgba(167,139,250,0.15)', text:'#a78bfa' },
  'Converted':  { bg:'rgba(52,211,153,0.15)',  text:'#34d399' },
  'Lost':       { bg:'rgba(248,113,113,0.15)', text:'#f87171' },
}
const SOURCE_ICONS = { Facebook:'📘', Instagram:'📸', Website:'🌐', Referral:'🤝', 'Walk-in':'🚶', WhatsApp:'💬', LinkedIn:'💼', Other:'📌' }

export default function TeamMyLeads({ onScheduleMeeting }) {
  const [leads, setLeads]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilter] = useState('')
  const [expanded, setExpanded]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterStatus) params.status = filterStatus
      if (search)       params.search = search
      const { data } = await api.get('/team-members/my-leads', { params })
      setLeads(data)
    } catch { toast.error('Failed to load leads') }
    finally { setLoading(false) }
  }, [filterStatus, search])

  useEffect(() => { load() }, [load])

  const statuses = ['New','Assigned','In Progress','Converted','Lost']

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white">My Leads</h2>
        <p className="text-sm text-white/40">Leads assigned to you</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name, contact…"
          className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition min-w-[180px]" />
        <select value={filterStatus} onChange={e => setFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#04065c] px-3 py-2 text-sm text-white outline-none transition">
          <option value="">All Status</option>
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
        {(filterStatus || search) && (
          <button onClick={() => { setFilter(''); setSearch('') }}
            className="rounded-xl border border-white/15 px-3 py-2 text-xs text-white/50 hover:bg-white/10 transition">Clear ✕</button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {statuses.map(s => {
          const c = STATUS_COLORS[s]; const cnt = leads.filter(l => l.status === s).length
          return (
            <button key={s} onClick={() => setFilter(filterStatus === s ? '' : s)}
              className={`rounded-xl border px-3 py-2.5 text-center transition ${filterStatus === s ? 'border-cyan-400/40 ring-1 ring-cyan-400/30' : 'border-white/10'}`}
              style={{ background: c.bg }}>
              <p className="text-lg font-extrabold" style={{ color: c.text }}>{cnt}</p>
              <p className="text-[10px] text-white/40 leading-tight">{s}</p>
            </button>
          )
        })}
      </div>

      {/* Leads */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" /></div>
      ) : leads.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-white/40 text-sm">No leads assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map(lead => {
            const gc = GRADE_COLORS[lead.grade] || GRADE_COLORS.Ungraded
            const sc = STATUS_COLORS[lead.status] || {}
            const isEx = expanded === lead._id
            return (
              <motion.div key={lead._id} layout
                className="rounded-2xl border border-white/10 overflow-hidden"
                style={{ background:'linear-gradient(135deg,rgba(4,6,92,0.8),rgba(2,62,138,0.5))' }}>
                <div className="flex flex-wrap items-start gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl border"
                    style={{ background: gc.bg, borderColor: gc.bg.replace('0.2','0.4') }}>
                    {gc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-sm">{lead.clientName}</h3>
                      <span className="text-xs rounded-full px-2 py-0.5 font-semibold border"
                        style={{ background: gc.bg, color: gc.text, borderColor: gc.bg.replace('0.2','0.4') }}>
                        {lead.grade}
                      </span>
                      <span className="text-xs rounded-full px-2 py-0.5 font-semibold"
                        style={{ background: sc.bg, color: sc.text }}>{lead.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-white/50">
                      <span>📞 {lead.contact}</span>
                      {lead.email && <span>✉️ {lead.email}</span>}
                      <span>{SOURCE_ICONS[lead.source] || '📌'} {lead.source}</span>
                    </div>
                    <p className="mt-1 text-xs text-white/50 line-clamp-1">{lead.purpose}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => onScheduleMeeting && onScheduleMeeting(lead)}
                      className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1.5 text-xs text-cyan-300 hover:bg-cyan-400/20 transition">
                      📅 Meeting
                    </button>
                    <button onClick={() => setExpanded(isEx ? null : lead._id)}
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/50 hover:bg-white/10 transition">
                      {isEx ? '▲' : '▼'}
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {isEx && (
                    <motion.div initial={{ height:0 }} animate={{ height:'auto' }} exit={{ height:0 }}
                      className="overflow-hidden border-t border-white/10">
                      <div className="p-4 space-y-2 text-sm">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Purpose / Interest</p>
                        <p className="text-white/70">{lead.purpose}</p>
                        {lead.notes && <>
                          <p className="text-xs text-white/40 uppercase tracking-wider mt-3 mb-1">Notes</p>
                          <p className="text-white/60">{lead.notes}</p>
                        </>}
                        <p className="text-xs text-white/30 mt-2">Added {new Date(lead.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</p>
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
