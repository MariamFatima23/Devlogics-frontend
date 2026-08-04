import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'
import toast from 'react-hot-toast'

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
const PLATFORM_ICONS = { 'Google Meet':'🟢','Zoom':'🔵','Phone Call':'📞','In-Person':'🏢','Microsoft Teams':'🟣','Other':'🌐' }
const OUTCOMES = ['Interested','Not Interested','Objection','Follow-up Required','Converted','No Show']

function Modal({ open, onClose, children, maxW='max-w-md' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div initial={{ scale:0.93, opacity:0 }} animate={{ scale:1, opacity:1 }}
        exit={{ scale:0.93, opacity:0 }} transition={{ type:'spring', stiffness:340, damping:28 }}
        className={`relative z-10 w-full ${maxW} rounded-2xl border border-white/10 shadow-2xl`}
        style={{ background:'linear-gradient(135deg,#04065c,#023e8a)' }}
        onClick={e => e.stopPropagation()}>{children}</motion.div>
    </div>
  )
}

export default function TeamMyMeetings({ prefillLead, onClearPrefill }) {
  const [meetings, setMeetings]     = useState([])
  const [leads, setLeads]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [filterStatus, setFilter]   = useState('')
  const [showSchedule, setShowSchedule] = useState(false)
  const [schedForm, setSchedForm]   = useState({ leadId:'', topic:'', meetingType:'Online', platform:'Google Meet', scheduledAt:'', durationMins:'30' })
  const [outcomeModal, setOutcomeModal] = useState(null)
  const [outcomeForm, setOutcomeForm]   = useState({ status:'Completed', outcome:'', outcomeNotes:'', nextActionDate:'' })
  const [reschedModal, setReschedModal] = useState(null)
  const [reschedForm, setReschedForm]   = useState({ scheduledAt:'', rescheduleReason:'' })
  const [saving, setSaving]         = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}; if (filterStatus) params.status = filterStatus
      const [mRes, lRes] = await Promise.all([
        api.get('/team-members/my-meetings', { params }),
        api.get('/team-members/my-leads'),
      ])
      setMeetings(mRes.data); setLeads(lRes.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }, [filterStatus])

  useEffect(() => { load() }, [load])

  // Pre-fill from "My Leads" schedule button
  useEffect(() => {
    if (prefillLead) {
      setSchedForm(p => ({ ...p, leadId: prefillLead._id, topic: `Meeting with ${prefillLead.clientName}` }))
      setShowSchedule(true)
      onClearPrefill && onClearPrefill()
    }
  }, [prefillLead])

  const sf = k => e => setSchedForm(p => ({ ...p, [k]: e.target.value }))

  const submitSchedule = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/meetings', {
        leadId: schedForm.leadId,
        meetingType: schedForm.meetingType,
        platform: schedForm.platform,
        topic: schedForm.topic,
        scheduledAt: schedForm.scheduledAt,
        durationMins: Number(schedForm.durationMins) || 30,
      })
      toast.success('Meeting scheduled!'); setShowSchedule(false); load()
    } catch (e) { toast.error(e.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const submitOutcome = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.put(`/team-members/meetings/${outcomeModal._id}`, {
        status: outcomeForm.status, outcome: outcomeForm.outcome,
        outcomeNotes: outcomeForm.outcomeNotes, nextActionDate: outcomeForm.nextActionDate || null,
      })
      toast.success('Outcome saved'); setOutcomeModal(null); load()
    } catch (e) { toast.error(e.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const submitReschedule = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.put(`/team-members/meetings/${reschedModal._id}`, {
        status: 'Rescheduled', scheduledAt: reschedForm.scheduledAt,
        rescheduleReason: reschedForm.rescheduleReason,
      })
      toast.success('Rescheduled!'); setReschedModal(null); load()
    } catch (e) { toast.error(e.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const fmtDT = d => d ? new Date(d).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'
  const fmtD  = d => d ? new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—'
  const isUpcoming = m => { const diff = new Date(m.scheduledAt) - new Date(); return m.status==='Pending' && diff>0 && diff<86400000 }

  const statuses = ['Pending','Completed','Rescheduled','Cancelled','Overdue']

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white">My Meetings</h2>
          <p className="text-sm text-white/40">Track and manage your client meetings</p>
        </div>
        <button onClick={() => { setSchedForm({ leadId:'', topic:'', meetingType:'Online', platform:'Google Meet', scheduledAt:'', durationMins:'30' }); setShowSchedule(true) }}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14"/></svg>
          Schedule
        </button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {statuses.map(s => {
          const st = STATUS_STYLES[s]; const cnt = meetings.filter(m => m.status === s).length
          return (
            <button key={s} onClick={() => setFilter(filterStatus === s ? '' : s)}
              className={`rounded-xl border px-3 py-2.5 text-center transition ${filterStatus === s ? 'border-cyan-400/40 ring-1 ring-cyan-400/30' : 'border-white/10'}`}
              style={{ background: st.bg }}>
              <p className="text-xl">{st.icon}</p>
              <p className="text-lg font-extrabold" style={{ color: st.text }}>{cnt}</p>
              <p className="text-[10px] text-white/40 leading-tight">{s}</p>
            </button>
          )
        })}
      </div>

      {/* Meetings list */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" /></div>
      ) : meetings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
          <p className="text-4xl mb-2">📅</p>
          <p className="text-white/40 text-sm">No meetings yet. Schedule your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map(m => {
            const ss = STATUS_STYLES[m.status] || STATUS_STYLES.Pending
            const oc = m.outcome ? (OUTCOME_STYLES[m.outcome] || {}) : null
            const upcoming = isUpcoming(m)
            return (
              <motion.div key={m._id} layout
                className={`rounded-2xl border overflow-hidden ${upcoming ? 'border-yellow-400/40' : 'border-white/10'}`}
                style={{ background:'linear-gradient(135deg,rgba(4,6,92,0.8),rgba(2,62,138,0.4))' }}>
                <div className="flex flex-wrap items-start gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl border"
                    style={{ background: ss.bg, borderColor: ss.bg.replace('0.15','0.3') }}>
                    {ss.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-sm">{m.topic}</h3>
                      {upcoming && <span className="rounded-full bg-yellow-400/20 px-2 py-0.5 text-[10px] font-bold text-yellow-300 animate-pulse">Soon</span>}
                      <span className="text-xs rounded-full px-2.5 py-0.5 font-semibold" style={{ background: ss.bg, color: ss.text }}>{m.status}</span>
                      {m.outcome && oc && <span className="text-xs rounded-full px-2.5 py-0.5 font-semibold" style={{ background: oc.bg, color: oc.text }}>{m.outcome}</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
                      {m.leadId && <span>👤 {m.leadId.clientName || 'Client'}</span>}
                      <span>{PLATFORM_ICONS[m.platform] || '🌐'} {m.platform}</span>
                      <span>📅 {fmtDT(m.scheduledAt)}</span>
                      <span>⏱ {m.durationMins} min</span>
                    </div>
                    {m.outcomeNotes && <p className="mt-1 text-xs text-white/40 italic line-clamp-1">"{m.outcomeNotes}"</p>}
                    {m.nextActionDate && <p className="mt-1 text-xs text-cyan-300/70">🗓 Next: {fmtD(m.nextActionDate)}</p>}
                  </div>
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    {(m.status === 'Pending' || m.status === 'Overdue') && <>
                      <button onClick={() => { setOutcomeForm({ status:'Completed', outcome:'', outcomeNotes:'', nextActionDate:'' }); setOutcomeModal(m) }}
                        className="rounded-lg border border-green-400/30 bg-green-400/10 px-2.5 py-1.5 text-xs text-green-300 hover:bg-green-400/20 transition">✅ Done</button>
                      <button onClick={() => { setReschedForm({ scheduledAt:'', rescheduleReason:'' }); setReschedModal(m) }}
                        className="rounded-lg border border-blue-400/30 bg-blue-400/10 px-2.5 py-1.5 text-xs text-blue-300 hover:bg-blue-400/20 transition">🔄 Reschedule</button>
                    </>}
                    {m.status === 'Completed' && (
                      <button onClick={() => { setOutcomeForm({ status:'Completed', outcome:m.outcome||'', outcomeNotes:m.outcomeNotes||'', nextActionDate: m.nextActionDate ? m.nextActionDate.split('T')[0] : '' }); setOutcomeModal(m) }}
                        className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/50 hover:bg-white/10 transition">✏️ Edit</button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Schedule Modal */}
      <AnimatePresence>
        {showSchedule && (
          <Modal open onClose={() => setShowSchedule(false)} maxW="max-w-lg">
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-white mb-5">Schedule Meeting</h3>
              <form onSubmit={submitSchedule} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Lead <span className="text-red-400">*</span></label>
                  <select value={schedForm.leadId} onChange={sf('leadId')} required
                    className="rounded-xl border border-white/10 bg-[#04065c] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 transition">
                    <option value="">— Select Lead —</option>
                    {leads.map(l => <option key={l._id} value={l._id}>{l.clientName} ({l.contact})</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Topic <span className="text-red-400">*</span></label>
                  <input value={schedForm.topic} onChange={sf('topic')} required placeholder="e.g. Course Enquiry, Demo"
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/60 transition" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Type</label>
                    <select value={schedForm.meetingType} onChange={sf('meetingType')}
                      className="rounded-xl border border-white/10 bg-[#04065c] px-3 py-2.5 text-sm text-white outline-none transition">
                      <option>Online</option><option>Onsite</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Platform</label>
                    <select value={schedForm.platform} onChange={sf('platform')}
                      className="rounded-xl border border-white/10 bg-[#04065c] px-3 py-2.5 text-sm text-white outline-none transition">
                      {['Google Meet','Zoom','Phone Call','In-Person','Microsoft Teams','Other'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Date & Time <span className="text-red-400">*</span></label>
                    <input type="datetime-local" value={schedForm.scheduledAt} onChange={sf('scheduledAt')} required
                      className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 transition [color-scheme:dark]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Duration (min)</label>
                    <input type="number" value={schedForm.durationMins} onChange={sf('durationMins')} min={5}
                      className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 transition" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowSchedule(false)} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/60 hover:bg-white/10 transition">Cancel</button>
                  <button type="submit" disabled={saving} className="rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-cyan-400 disabled:opacity-50 transition">
                    {saving ? 'Saving…' : 'Schedule'}
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
          <Modal open onClose={() => setOutcomeModal(null)}>
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-1">Meeting Outcome</h3>
              <p className="text-sm text-white/50 mb-4">"{outcomeModal.topic}"</p>
              <form onSubmit={submitOutcome} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Mark as</label>
                  <select value={outcomeForm.status} onChange={e => setOutcomeForm(p => ({ ...p, status: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-[#04065c] px-3 py-2.5 text-sm text-white outline-none transition">
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Outcome</label>
                  <select value={outcomeForm.outcome} onChange={e => setOutcomeForm(p => ({ ...p, outcome: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-[#04065c] px-3 py-2.5 text-sm text-white outline-none transition">
                    <option value="">— Select —</option>
                    {OUTCOMES.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Notes</label>
                  <textarea value={outcomeForm.outcomeNotes} onChange={e => setOutcomeForm(p => ({ ...p, outcomeNotes: e.target.value }))}
                    rows={3} placeholder="What happened?"
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/60 resize-none transition" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Next Action Date</label>
                  <input type="date" value={outcomeForm.nextActionDate} onChange={e => setOutcomeForm(p => ({ ...p, nextActionDate: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 transition [color-scheme:dark]" />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setOutcomeModal(null)} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/60 hover:bg-white/10 transition">Cancel</button>
                  <button type="submit" disabled={saving} className="rounded-xl bg-green-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-400 disabled:opacity-50 transition">
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
        {reschedModal && (
          <Modal open onClose={() => setReschedModal(null)}>
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-1">Reschedule Meeting</h3>
              <p className="text-sm text-white/50 mb-4">"{reschedModal.topic}"</p>
              <form onSubmit={submitReschedule} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">New Date & Time <span className="text-red-400">*</span></label>
                  <input type="datetime-local" value={reschedForm.scheduledAt} onChange={e => setReschedForm(p => ({ ...p, scheduledAt: e.target.value }))} required
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 transition [color-scheme:dark]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Reason</label>
                  <textarea value={reschedForm.rescheduleReason} onChange={e => setReschedForm(p => ({ ...p, rescheduleReason: e.target.value }))}
                    rows={2} placeholder="Optional reason…"
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/60 resize-none transition" />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setReschedModal(null)} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/60 hover:bg-white/10 transition">Cancel</button>
                  <button type="submit" disabled={saving} className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-400 disabled:opacity-50 transition">
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
