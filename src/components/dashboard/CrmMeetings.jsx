import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const MEETING_TYPES = ['Online', 'Onsite']
const PLATFORMS     = ['Google Meet', 'Zoom', 'Phone Call', 'In-Person', 'Microsoft Teams', 'Other']
const STATUSES      = ['Pending', 'Completed', 'Rescheduled', 'Cancelled', 'Overdue']
const OUTCOMES      = ['Interested', 'Not Interested', 'Objection', 'Follow-up Required', 'Converted', 'No Show']

const STATUS_STYLES = {
  Pending:     { bg:'rgba(251,191,36,0.15)',  text:'#fbbf24', icon:'⏳' },
  Completed:   { bg:'rgba(52,211,153,0.15)',  text:'#34d399', icon:'✅' },
  Rescheduled: { bg:'rgba(147,197,253,0.15)', text:'#93c5fd', icon:'🔄' },
  Cancelled:   { bg:'rgba(255,255,255,0.08)', text:'rgba(255,255,255,0.4)', icon:'❌' },
  Overdue:     { bg:'rgba(248,113,113,0.15)', text:'#f87171', icon:'🚨' },
}

const OUTCOME_STYLES = {
  Interested:          { bg:'rgba(52,211,153,0.15)',  text:'#34d399' },
  'Not Interested':    { bg:'rgba(248,113,113,0.15)', text:'#f87171' },
  Objection:           { bg:'rgba(251,191,36,0.15)',  text:'#fbbf24' },
  'Follow-up Required':{ bg:'rgba(147,197,253,0.15)', text:'#93c5fd' },
  Converted:           { bg:'rgba(167,139,250,0.15)', text:'#a78bfa' },
  'No Show':           { bg:'rgba(255,255,255,0.08)', text:'rgba(255,255,255,0.4)' },
}

const PLATFORM_ICONS = {
  'Google Meet':'🟢', 'Zoom':'🔵', 'Phone Call':'📞',
  'In-Person':'🏢', 'Microsoft Teams':'🟣', 'Other':'🌐',
}

const EMPTY_FORM = {
  leadId:'', teamMemberId:'', meetingType:'Online', platform:'Google Meet',
  topic:'', scheduledAt:'', durationMins:'30',
}

const EMPTY_OUTCOME = { status:'Completed', outcome:'', outcomeNotes:'', nextActionDate:'' }
const EMPTY_RESCHEDULE = { scheduledAt:'', rescheduleReason:'' }

function Modal({ open, onClose, children, maxW = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ scale:0.93, opacity:0 }} animate={{ scale:1, opacity:1 }}
        exit={{ scale:0.93, opacity:0 }} transition={{ type:'spring', stiffness:340, damping:28 }}
        className={`relative z-10 w-full ${maxW} rounded-2xl border border-white/10 shadow-2xl`}
        style={{ background:'linear-gradient(135deg,#04065c,#023e8a)' }}
        onClick={e => e.stopPropagation()}
      >{children}</motion.div>
    </div>
  )
}

function FLabel({ children, required }) {
  return (
    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
      {children}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
  )
}

export default function CrmMeetings() {
  const [meetings, setMeetings]   = useState([])
  const [leads, setLeads]         = useState([])
  const [team, setTeam]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [editMeeting, setEditMeeting] = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)

  // Outcome modal
  const [outcomeModal, setOutcomeModal] = useState(null)
  const [outcomeForm, setOutcomeForm]   = useState(EMPTY_OUTCOME)

  // Reschedule modal
  const [rescheduleModal, setRescheduleModal] = useState(null)
  const [rescheduleForm, setRescheduleForm]   = useState(EMPTY_RESCHEDULE)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterStatus) params.status = filterStatus
      const [mRes, lRes, tRes] = await Promise.all([
        api.get('/meetings', { params }),
        api.get('/leads'),
        api.get('/team-members'),
      ])
      setMeetings(mRes.data)
      setLeads(lRes.data)
      setTeam(tRes.data.filter(m => m.status === 'Active'))
    } catch { toast.error('Failed to load meetings') }
    finally { setLoading(false) }
  }, [filterStatus])

  useEffect(() => { load() }, [load])

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const openAdd = () => { setForm(EMPTY_FORM); setEditMeeting(null); setShowForm(true) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = {
        ...form,
        teamMemberId:   form.teamMemberId || null,
        teamMemberName: team.find(t => t._id === form.teamMemberId)?.name || '',
        durationMins:   Number(form.durationMins) || 30,
      }
      if (editMeeting) {
        await api.put(`/meetings/${editMeeting._id}`, payload)
        toast.success('Meeting updated')
      } else {
        await api.post('/meetings', payload)
        toast.success('Meeting scheduled')
      }
      setShowForm(false); load()
    } catch (e) { toast.error(e.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const deleteMeeting = async (id) => {
    if (!window.confirm('Delete this meeting?')) return
    try { await api.delete(`/meetings/${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Error') }
  }

  // Outcome submit
  const submitOutcome = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.put(`/meetings/${outcomeModal._id}`, {
        status:  outcomeForm.status,
        outcome: outcomeForm.outcome,
        outcomeNotes: outcomeForm.outcomeNotes,
        nextActionDate: outcomeForm.nextActionDate || null,
      })
      toast.success('Outcome saved')
      setOutcomeModal(null); load()
    } catch (e) { toast.error(e.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  // Reschedule submit
  const submitReschedule = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.put(`/meetings/${rescheduleModal._id}`, {
        status:           'Rescheduled',
        scheduledAt:      rescheduleForm.scheduledAt,
        rescheduleReason: rescheduleForm.rescheduleReason,
      })
      toast.success('Meeting rescheduled')
      setRescheduleModal(null); load()
    } catch (e) { toast.error(e.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const openOutcome = (m) => {
    setOutcomeForm({ status: m.status === 'Completed' ? 'Completed' : 'Completed', outcome: m.outcome || '', outcomeNotes: m.outcomeNotes || '', nextActionDate: m.nextActionDate ? m.nextActionDate.split('T')[0] : '' })
    setOutcomeModal(m)
  }

  // Stats
  const statsCount = (s) => meetings.filter(m => m.status === s).length

  // Format date
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—'
  const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'

  // Whether a meeting is upcoming (within next 24h)
  const isUpcoming = (m) => {
    if (m.status !== 'Pending') return false
    const diff = new Date(m.scheduledAt) - new Date()
    return diff > 0 && diff < 86400000
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white">Meetings</h2>
          <p className="text-sm text-white/40">Schedule and track client meetings</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14"/></svg>
          Schedule Meeting
        </button>
      </div>

      {/* Status filter cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATUSES.map(s => {
          const st = STATUS_STYLES[s]
          const count = statsCount(s)
          return (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
              className={`rounded-xl border px-3 py-3 text-center transition ${filterStatus === s ? 'border-cyan-400/40 ring-1 ring-cyan-400/30' : 'border-white/10'}`}
              style={{ background: st.bg }}>
              <p className="text-xl">{st.icon}</p>
              <p className="text-xl font-extrabold mt-0.5" style={{ color: st.text }}>{count}</p>
              <p className="text-[10px] text-white/50 leading-tight">{s}</p>
            </button>
          )
        })}
      </div>

      {/* Meetings List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
        </div>
      ) : meetings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-white/40 text-sm">No meetings scheduled yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map(m => {
            const ss  = STATUS_STYLES[m.status] || STATUS_STYLES.Pending
            const oc  = m.outcome ? (OUTCOME_STYLES[m.outcome] || {}) : null
            const upcoming = isUpcoming(m)
            const leadObj  = m.leadId
            return (
              <motion.div key={m._id} layout
                className={`rounded-2xl border overflow-hidden transition ${upcoming ? 'border-yellow-400/40' : 'border-white/10'}`}
                style={{ background:'linear-gradient(135deg,rgba(4,6,92,0.8),rgba(2,62,138,0.4))' }}>
                <div className="p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    {/* Status icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg border"
                      style={{ background: ss.bg, borderColor: ss.bg.replace('0.15','0.3') }}>
                      {ss.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-white text-sm">{m.topic}</h3>
                        {upcoming && <span className="rounded-full bg-yellow-400/20 px-2 py-0.5 text-[10px] font-bold text-yellow-300 animate-pulse">Soon</span>}
                        <span className="text-xs rounded-full px-2.5 py-0.5 font-semibold" style={{ background: ss.bg, color: ss.text }}>{m.status}</span>
                        {m.outcome && oc && (
                          <span className="text-xs rounded-full px-2.5 py-0.5 font-semibold" style={{ background: oc.bg, color: oc.text }}>{m.outcome}</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50 mt-1">
                        <span>👤 {typeof leadObj === 'object' ? leadObj?.clientName : m.leadName}</span>
                        <span>{PLATFORM_ICONS[m.platform] || '🌐'} {m.platform}</span>
                        <span>{m.meetingType === 'Online' ? '💻' : '🏢'} {m.meetingType}</span>
                        <span>📅 {fmtDateTime(m.scheduledAt)}</span>
                        <span>⏱ {m.durationMins} min</span>
                        {m.teamMemberId && <span>🧑‍💼 {typeof m.teamMemberId === 'object' ? m.teamMemberId.name : m.teamMemberName}</span>}
                      </div>

                      {m.outcomeNotes && (
                        <p className="mt-1.5 text-xs text-white/40 line-clamp-1 italic">"{m.outcomeNotes}"</p>
                      )}
                      {m.nextActionDate && (
                        <p className="mt-1 text-xs text-cyan-300/70">🗓 Next action: {fmtDate(m.nextActionDate)}</p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-1.5 shrink-0">
                      {(m.status === 'Pending' || m.status === 'Overdue') && (
                        <>
                          <button onClick={() => openOutcome(m)}
                            className="rounded-lg border border-green-400/30 bg-green-400/10 px-2.5 py-1.5 text-xs text-green-300 hover:bg-green-400/20 transition">
                            ✅ Outcome
                          </button>
                          <button onClick={() => { setRescheduleForm({ scheduledAt:'', rescheduleReason:'' }); setRescheduleModal(m) }}
                            className="rounded-lg border border-blue-400/30 bg-blue-400/10 px-2.5 py-1.5 text-xs text-blue-300 hover:bg-blue-400/20 transition">
                            🔄 Reschedule
                          </button>
                        </>
                      )}
                      {m.status === 'Completed' && (
                        <button onClick={() => openOutcome(m)}
                          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/50 hover:bg-white/10 transition">
                          ✏️ Edit Outcome
                        </button>
                      )}
                      <button onClick={() => deleteMeeting(m._id)}
                        className="rounded-lg border border-red-400/20 bg-red-400/10 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-400/20 transition">✕</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Schedule / Edit Meeting Modal */}
      <AnimatePresence>
        {showForm && (
          <Modal open onClose={() => setShowForm(false)}>
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-white mb-5">{editMeeting ? 'Edit Meeting' : 'Schedule Meeting'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Lead */}
                <div className="flex flex-col gap-1">
                  <FLabel required>Lead / Client</FLabel>
                  <select value={form.leadId} onChange={f('leadId')} required
                    className="rounded-xl border border-white/10 bg-[#04065c] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 transition">
                    <option value="">— Select Lead —</option>
                    {leads.map(l => <option key={l._id} value={l._id}>{l.clientName} ({l.contact})</option>)}
                  </select>
                </div>
                {/* Team Member */}
                <div className="flex flex-col gap-1">
                  <FLabel>Assign Team Member</FLabel>
                  <select value={form.teamMemberId} onChange={f('teamMemberId')}
                    className="rounded-xl border border-white/10 bg-[#04065c] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 transition">
                    <option value="">— None / Unassigned —</option>
                    {team.map(t => <option key={t._id} value={t._id}>{t.name} ({t.role})</option>)}
                  </select>
                </div>
                {/* Topic */}
                <div className="flex flex-col gap-1">
                  <FLabel required>Meeting Topic</FLabel>
                  <input value={form.topic} onChange={f('topic')} required placeholder="e.g. Course Enquiry, Demo, Follow-up"
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/60 transition" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* Type */}
                  <div className="flex flex-col gap-1">
                    <FLabel required>Type</FLabel>
                    <select value={form.meetingType} onChange={f('meetingType')} required
                      className="rounded-xl border border-white/10 bg-[#04065c] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 transition">
                      {MEETING_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  {/* Platform */}
                  <div className="flex flex-col gap-1">
                    <FLabel>Platform</FLabel>
                    <select value={form.platform} onChange={f('platform')}
                      className="rounded-xl border border-white/10 bg-[#04065c] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 transition">
                      {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* Date/Time */}
                  <div className="flex flex-col gap-1">
                    <FLabel required>Date & Time</FLabel>
                    <input type="datetime-local" value={form.scheduledAt} onChange={f('scheduledAt')} required
                      className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 transition [color-scheme:dark]" />
                  </div>
                  {/* Duration */}
                  <div className="flex flex-col gap-1">
                    <FLabel>Duration (min)</FLabel>
                    <input type="number" value={form.durationMins} onChange={f('durationMins')} min={5} max={480}
                      className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 transition" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/60 hover:bg-white/10 transition">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-cyan-400 disabled:opacity-50 transition">
                    {saving ? 'Saving…' : editMeeting ? 'Update' : 'Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Outcome Modal */}
      <AnimatePresence>
        {outcomeModal && (
          <Modal open onClose={() => setOutcomeModal(null)} maxW="max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-1">Meeting Outcome</h3>
              <p className="text-sm text-white/50 mb-5">"{outcomeModal.topic}"</p>
              <form onSubmit={submitOutcome} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <FLabel required>Mark as</FLabel>
                  <select value={outcomeForm.status} onChange={e => setOutcomeForm(p => ({ ...p, status: e.target.value }))} required
                    className="rounded-xl border border-white/10 bg-[#04065c] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 transition">
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <FLabel>Outcome</FLabel>
                  <select value={outcomeForm.outcome} onChange={e => setOutcomeForm(p => ({ ...p, outcome: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-[#04065c] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 transition">
                    <option value="">— Select Outcome —</option>
                    {OUTCOMES.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <FLabel>Notes</FLabel>
                  <textarea value={outcomeForm.outcomeNotes} onChange={e => setOutcomeForm(p => ({ ...p, outcomeNotes: e.target.value }))}
                    rows={3} placeholder="What happened in the meeting?"
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/60 resize-none transition" />
                </div>
                <div className="flex flex-col gap-1">
                  <FLabel>Next Action Date</FLabel>
                  <input type="date" value={outcomeForm.nextActionDate} onChange={e => setOutcomeForm(p => ({ ...p, nextActionDate: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 transition [color-scheme:dark]" />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setOutcomeModal(null)}
                    className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/60 hover:bg-white/10 transition">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="rounded-xl bg-green-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-400 disabled:opacity-50 transition">
                    {saving ? 'Saving…' : 'Save Outcome'}
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {rescheduleModal && (
          <Modal open onClose={() => setRescheduleModal(null)} maxW="max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-1">Reschedule Meeting</h3>
              <p className="text-sm text-white/50 mb-5">"{rescheduleModal.topic}"</p>
              <form onSubmit={submitReschedule} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <FLabel required>New Date & Time</FLabel>
                  <input type="datetime-local" value={rescheduleForm.scheduledAt}
                    onChange={e => setRescheduleForm(p => ({ ...p, scheduledAt: e.target.value }))} required
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 transition [color-scheme:dark]" />
                </div>
                <div className="flex flex-col gap-1">
                  <FLabel>Reason for Rescheduling</FLabel>
                  <textarea value={rescheduleForm.rescheduleReason}
                    onChange={e => setRescheduleForm(p => ({ ...p, rescheduleReason: e.target.value }))}
                    rows={2} placeholder="Optional reason…"
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/60 resize-none transition" />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setRescheduleModal(null)}
                    className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/60 hover:bg-white/10 transition">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-400 disabled:opacity-50 transition">
                    {saving ? 'Saving…' : '🔄 Reschedule'}
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}
