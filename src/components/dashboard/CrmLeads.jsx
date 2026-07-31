import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const SOURCES  = ['Facebook','Instagram','Website','Referral','Walk-in','WhatsApp','LinkedIn','Other']
const STATUSES = ['New','Assigned','In Progress','Converted','Lost']
const GRADES   = ['Diamond','Silver','Bronze','Ungraded']

const GRADE_COLORS = {
  Diamond: { bg: 'rgba(147,197,253,0.2)', text: '#60a5fa', border: 'rgba(147,197,253,0.4)' },
  Silver:  { bg: 'rgba(209,213,219,0.2)', text: '#d1d5db', border: 'rgba(209,213,219,0.4)' },
  Bronze:  { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24', border: 'rgba(251,191,36,0.3)'  },
  Ungraded:{ bg: 'rgba(255,255,255,0.05)', text: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.1)' },
}

const STATUS_COLORS = {
  'New':        { bg:'rgba(56,189,248,0.15)', text:'#38bdf8' },
  'Assigned':   { bg:'rgba(251,191,36,0.15)', text:'#fbbf24' },
  'In Progress':{ bg:'rgba(167,139,250,0.15)', text:'#a78bfa' },
  'Converted':  { bg:'rgba(52,211,153,0.15)', text:'#34d399' },
  'Lost':       { bg:'rgba(248,113,113,0.15)', text:'#f87171' },
}

const SOURCE_ICONS = {
  Facebook:'📘', Instagram:'📸', Website:'🌐', Referral:'🤝',
  'Walk-in':'🚶', WhatsApp:'💬', LinkedIn:'💼', Other:'📌',
}

const EMPTY_FORM = { clientName:'', contact:'', email:'', source:'Facebook', purpose:'', notes:'', grade:'Ungraded' }

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }} transition={{ type:'spring', stiffness:340, damping:28 }}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl"
        style={{ background:'linear-gradient(135deg,#04065c,#023e8a)' }}
        onClick={e => e.stopPropagation()}
      >{children}</motion.div>
    </div>
  )
}

function Input({ label, value, onChange, type='text', required=false, ...rest }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type} value={value} onChange={onChange} required={required}
        className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/60 focus:bg-white/15 transition"
        {...rest}
      />
    </div>
  )
}

function Select({ label, value, onChange, options, required=false }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <select
        value={value} onChange={onChange} required={required}
        className="rounded-xl border border-white/10 bg-[#04065c] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 transition"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

// ── Assign Modal ────────────────────────────────────────────────────
function AssignModal({ lead, teamMembers, existingAssignments, onClose, onDone }) {
  const [selected, setSelected] = useState(existingAssignments.map(a => a.teamMemberId?._id || a.teamMemberId))
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const toggle = id => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const save = async () => {
    const newOnes = selected.filter(id => !existingAssignments.some(a => (a.teamMemberId?._id || a.teamMemberId) === id))
    if (newOnes.length === 0) { toast('No new assignments to add'); return }
    setSaving(true)
    try {
      await api.post(`/leads/${lead._id}/assign`, { teamMemberIds: newOnes, note })
      toast.success('Assigned successfully')
      onDone()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error')
    } finally { setSaving(false) }
  }

  const removeAssignment = async (assignmentId) => {
    try {
      await api.delete(`/leads/assignments/${assignmentId}`)
      toast.success('Removed')
      onDone()
    } catch { toast.error('Error removing') }
  }

  return (
    <Modal open onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-bold text-white mb-1">Assign Lead</h3>
        <p className="text-sm text-white/50 mb-4">{lead.clientName}</p>

        {existingAssignments.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Currently Assigned</p>
            <div className="flex flex-wrap gap-2">
              {existingAssignments.map(a => (
                <span key={a._id} className="flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-3 py-1 text-xs text-cyan-300">
                  {a.teamMemberId?.name || a.teamMemberName}
                  <button onClick={() => removeAssignment(a._id)} className="hover:text-red-400 transition">✕</button>
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Select Team Members</p>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-4">
          {teamMembers.filter(m => m.status === 'Active').map(m => {
            const alreadyAssigned = existingAssignments.some(a => (a.teamMemberId?._id || a.teamMemberId) === m._id)
            const isSelected = selected.includes(m._id)
            return (
              <button key={m._id} onClick={() => !alreadyAssigned && toggle(m._id)}
                disabled={alreadyAssigned}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm text-left transition ${
                  alreadyAssigned ? 'opacity-40 cursor-not-allowed border-white/5 bg-white/5' :
                  isSelected ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-200' :
                  'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                }`}>
                <span className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-white/30'}`}>
                  {(isSelected || alreadyAssigned) && <span className="text-[10px] text-white font-bold">✓</span>}
                </span>
                <span className="flex-1">{m.name}</span>
                <span className="text-xs text-white/40 bg-white/10 rounded-full px-2 py-0.5">{m.role}</span>
                {alreadyAssigned && <span className="text-xs text-green-400">Assigned</span>}
              </button>
            )
          })}
        </div>

        <div className="mb-4">
          <Input label="Note (optional)" value={note} onChange={e => setNote(e.target.value)} placeholder="Assignment note..." />
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/60 hover:bg-white/10 transition">Cancel</button>
          <button onClick={save} disabled={saving}
            className="rounded-xl bg-cyan-500 px-5 py-2 text-sm font-bold text-white hover:bg-cyan-400 disabled:opacity-50 transition">
            {saving ? 'Saving…' : 'Assign'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Main CrmLeads component ─────────────────────────────────────────
export default function CrmLeads() {
  const [leads, setLeads]         = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterGrade, setFilterGrade]   = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [search, setSearch]       = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [editLead, setEditLead]   = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [assignLead, setAssignLead] = useState(null)
  const [expandedLead, setExpandedLead] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterStatus) params.status = filterStatus
      if (filterGrade)  params.grade  = filterGrade
      if (filterSource) params.source = filterSource
      if (search)       params.search = search
      const [lRes, tRes] = await Promise.all([
        api.get('/leads', { params }),
        api.get('/team-members'),
      ])
      setLeads(lRes.data)
      setTeamMembers(tRes.data)
    } catch (e) {
      toast.error('Failed to load leads')
    } finally { setLoading(false) }
  }, [filterStatus, filterGrade, filterSource, search])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setForm(EMPTY_FORM); setEditLead(null); setShowForm(true) }
  const openEdit = (lead) => {
    setForm({ clientName:lead.clientName, contact:lead.contact, email:lead.email||'',
      source:lead.source, purpose:lead.purpose, notes:lead.notes||'', grade:lead.grade })
    setEditLead(lead)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editLead) {
        await api.put(`/leads/${editLead._id}`, form)
        toast.success('Lead updated')
      } else {
        await api.post('/leads', form)
        toast.success('Lead added')
      }
      setShowForm(false)
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error')
    } finally { setSaving(false) }
  }

  const deleteLead = async (id) => {
    if (!window.confirm('Delete this lead?')) return
    try {
      await api.delete(`/leads/${id}`)
      toast.success('Deleted')
      load()
    } catch { toast.error('Error') }
  }

  const updateStatus = async (lead, status) => {
    try {
      await api.put(`/leads/${lead._id}`, { status })
      setLeads(prev => prev.map(l => l._id === lead._id ? { ...l, status } : l))
      toast.success('Status updated')
    } catch { toast.error('Error') }
  }

  const f = v => e => setForm(p => ({ ...p, [v]: e.target.value }))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white">CRM Leads</h2>
          <p className="text-sm text-white/40">Manage and track all your leads</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14"/></svg>
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name, contact…"
          className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50 transition min-w-[200px]" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#04065c] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 transition">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#04065c] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 transition">
          <option value="">All Grades</option>
          {GRADES.map(g => <option key={g}>{g}</option>)}
        </select>
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#04065c] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 transition">
          <option value="">All Sources</option>
          {SOURCES.map(s => <option key={s}>{s}</option>)}
        </select>
        {(filterStatus||filterGrade||filterSource||search) &&
          <button onClick={() => { setFilterStatus(''); setFilterGrade(''); setFilterSource(''); setSearch('') }}
            className="rounded-xl border border-white/15 px-3 py-2 text-xs text-white/50 hover:bg-white/10 transition">
            Clear Filters
          </button>}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATUSES.map(s => {
          const count = leads.filter(l => l.status === s).length
          const col = STATUS_COLORS[s]
          return (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
              className={`rounded-xl border px-3 py-3 text-center transition ${filterStatus === s ? 'border-cyan-400/40 ring-1 ring-cyan-400/30' : 'border-white/10'}`}
              style={{ background: col.bg }}>
              <p className="text-xl font-extrabold" style={{ color: col.text }}>{count}</p>
              <p className="text-xs text-white/50 mt-0.5">{s}</p>
            </button>
          )
        })}
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-white/40 text-sm">No leads found. Add your first lead!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map(lead => {
            const gc   = GRADE_COLORS[lead.grade] || GRADE_COLORS.Ungraded
            const sc   = STATUS_COLORS[lead.status] || {}
            const isEx = expandedLead === lead._id
            return (
              <motion.div key={lead._id} layout
                className="rounded-2xl border border-white/10 overflow-hidden"
                style={{ background:'linear-gradient(135deg,rgba(4,6,92,0.8),rgba(2,62,138,0.5))' }}>
                {/* Card Header */}
                <div className="flex flex-wrap items-start gap-3 p-4">
                  {/* Grade badge */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg border"
                    style={{ background: gc.bg, borderColor: gc.border }}>
                    {lead.grade === 'Diamond' ? '💎' : lead.grade === 'Silver' ? '🥈' : lead.grade === 'Bronze' ? '🥉' : '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-sm">{lead.clientName}</h3>
                      <span className="text-xs rounded-full px-2 py-0.5 font-semibold border"
                        style={{ background: gc.bg, color: gc.text, borderColor: gc.border }}>
                        {lead.grade}
                      </span>
                      <span className="text-xs rounded-full px-2 py-0.5 font-semibold"
                        style={{ background: sc.bg, color: sc.text }}>
                        {lead.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-white/50">
                      <span>📞 {lead.contact}</span>
                      {lead.email && <span>✉️ {lead.email}</span>}
                      <span>{SOURCE_ICONS[lead.source] || '📌'} {lead.source}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-white/60 line-clamp-1">{lead.purpose}</p>
                    {/* Assigned members */}
                    {lead.assignments?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {lead.assignments.map(a => (
                          <span key={a._id} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/70">
                            👤 {a.teamMemberId?.name || a.teamMemberName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => setExpandedLead(isEx ? null : lead._id)}
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/60 hover:bg-white/15 transition">
                      {isEx ? '▲' : '▼'}
                    </button>
                    <button onClick={() => setAssignLead(lead)}
                      className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1.5 text-xs text-cyan-300 hover:bg-cyan-400/20 transition">
                      Assign
                    </button>
                    <button onClick={() => openEdit(lead)}
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/60 hover:bg-white/15 transition">
                      Edit
                    </button>
                    <button onClick={() => deleteLead(lead._id)}
                      className="rounded-lg border border-red-400/20 bg-red-400/10 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-400/20 transition">
                      ✕
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isEx && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden border-t border-white/10">
                      <div className="p-4 space-y-3">
                        {lead.notes && (
                          <div>
                            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Notes</p>
                            <p className="text-sm text-white/70">{lead.notes}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Purpose</p>
                          <p className="text-sm text-white/70">{lead.purpose}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Update Status</p>
                          <div className="flex flex-wrap gap-2">
                            {STATUSES.map(s => (
                              <button key={s} onClick={() => updateStatus(lead, s)}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition border ${
                                  lead.status === s ? 'border-cyan-400/50 bg-cyan-400/20 text-cyan-300' : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
                                }`}>{s}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Update Grade</p>
                          <div className="flex flex-wrap gap-2">
                            {GRADES.map(g => {
                              const gc2 = GRADE_COLORS[g]
                              return (
                                <button key={g} onClick={async () => { await api.put(`/leads/${lead._id}`, { grade: g }); load(); toast.success('Grade updated') }}
                                  className="rounded-full px-3 py-1 text-xs font-semibold border transition"
                                  style={{
                                    background: lead.grade === g ? gc2.bg : 'rgba(255,255,255,0.05)',
                                    color: lead.grade === g ? gc2.text : 'rgba(255,255,255,0.4)',
                                    borderColor: lead.grade === g ? gc2.border : 'rgba(255,255,255,0.1)',
                                  }}>{g}</button>
                              )
                            })}
                          </div>
                        </div>
                        <p className="text-xs text-white/30">Added {new Date(lead.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <Modal open onClose={() => setShowForm(false)}>
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-white mb-5">{editLead ? 'Edit Lead' : 'Add New Lead'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Client Name" value={form.clientName} onChange={f('clientName')} required placeholder="Full name" />
                  <Input label="Contact" value={form.contact} onChange={f('contact')} required placeholder="Phone number" />
                </div>
                <Input label="Email" value={form.email} onChange={f('email')} type="email" placeholder="Optional" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select label="Source" value={form.source} onChange={f('source')} options={SOURCES} required />
                  <Select label="Grade" value={form.grade} onChange={f('grade')} options={GRADES} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Purpose / Interest <span className="text-red-400">*</span>
                  </label>
                  <textarea value={form.purpose} onChange={f('purpose')} required rows={2}
                    placeholder="What course or service are they interested in?"
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/60 resize-none transition" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Notes</label>
                  <textarea value={form.notes} onChange={f('notes')} rows={2}
                    placeholder="Optional notes…"
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/60 resize-none transition" />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/60 hover:bg-white/10 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-cyan-400 disabled:opacity-50 transition shadow-lg shadow-cyan-500/20">
                    {saving ? 'Saving…' : editLead ? 'Update' : 'Add Lead'}
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Assign Modal */}
      <AnimatePresence>
        {assignLead && (
          <AssignModal
            lead={assignLead}
            teamMembers={teamMembers}
            existingAssignments={assignLead.assignments || []}
            onClose={() => setAssignLead(null)}
            onDone={() => { setAssignLead(null); load() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
