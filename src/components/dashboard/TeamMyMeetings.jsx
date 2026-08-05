import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const STATUS_META = {
  Pending:     { bg:'#fffbeb', text:'#d97706', border:'#fde68a', icon:'⏳' },
  Completed:   { bg:'#f0fdf4', text:'#059669', border:'#a7f3d0', icon:'✅' },
  Rescheduled: { bg:'#eff6ff', text:'#2563eb', border:'#bfdbfe', icon:'🔄' },
  Cancelled:   { bg:'#f8fafc', text:'#64748b', border:'#e2e8f0', icon:'❌' },
  Overdue:     { bg:'#fff1f2', text:'#dc2626', border:'#fecaca', icon:'🚨' },
}
const OUTCOME_META = {
  'Interested':           { bg:'#f0fdf4', text:'#059669' },
  'Not Interested':       { bg:'#fff1f2', text:'#dc2626' },
  'Objection':            { bg:'#fffbeb', text:'#d97706' },
  'Follow-up Required':   { bg:'#eff6ff', text:'#2563eb' },
  'Converted':            { bg:'#f5f3ff', text:'#7c3aed' },
  'No Show':              { bg:'#f8fafc', text:'#64748b' },
}
const PLATFORM_ICONS = {
  'Google Meet':'🟢', 'Zoom':'🔵', 'Phone Call':'📞',
  'In-Person':'🏢', 'Microsoft Teams':'🟣', 'Other':'🌐',
}
const OUTCOMES  = ['Interested','Not Interested','Objection','Follow-up Required','Converted','No Show']
const STATUSES  = ['Pending','Completed','Rescheduled','Cancelled','Overdue']
const PLATFORMS = ['Google Meet','Zoom','Phone Call','In-Person','Microsoft Teams','Other']

// ── WhatsApp link builder ─────────────────────────────────────────
function buildWA(meeting) {
  const contact = meeting.leadContact || (typeof meeting.leadId === 'object' ? meeting.leadId?.contact : '')
  if (!contact) return null
  const cleaned = contact.replace(/[\s\-\+()]/g, '').replace(/^0/, '92')
  const dt = meeting.scheduledAt
    ? new Date(meeting.scheduledAt).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
    : ''
  const name = meeting.leadName || (typeof meeting.leadId === 'object' ? meeting.leadId?.clientName : '') || 'Client'
  let msg = `Hello ${name},\n\nYour meeting has been scheduled:\n📅 Date & Time: ${dt}\n⏱ Duration: ${meeting.durationMins || 30} min\n📋 Topic: ${meeting.topic}`
  if (meeting.meetingLink) msg += `\n🔗 Meeting Link: ${meeting.meetingLink}`
  msg += `\n\nPlease join on time. Thank you!`
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(msg)}`
}

// ── Check overdue client-side ─────────────────────────────────────
function isOverdue(m) {
  return m.status === 'Pending' && new Date(m.scheduledAt) < new Date()
}
function isUpcoming(m) {
  if (m.status !== 'Pending') return false
  const diff = new Date(m.scheduledAt) - new Date()
  return diff > 0 && diff < 86400000
}

// ── Modal wrapper ─────────────────────────────────────────────────
function Modal({ open, onClose, title, subtitle, children, maxW = 'max-w-md' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(3,4,94,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        className={`relative w-full ${maxW} bg-white shadow-2xl overflow-hidden
          rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col`}
        onClick={e => e.stopPropagation()}>
        <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg,#04065c,#48cae4)' }} />
        <div className="px-5 pt-4 pb-2 shrink-0 border-b border-gray-100">
          <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4">{children}</div>
      </motion.div>
    </div>
  )
}

// ── Field helpers ─────────────────────────────────────────────────
function FRow({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="dp-label-text">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {children}
    </div>
  )
}

export default function TeamMyMeetings({ prefillLead, onClearPrefill }) {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState([])
  const [leads,    setLeads]    = useState([])
  const [myMemberId, setMyMemberId] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [filterStatus, setFS]   = useState('')

  // Schedule form
  const [showSched,  setShowSched]  = useState(false)
  const [schedForm,  setSchedForm]  = useState({ leadId:'', topic:'', meetingType:'Online', platform:'Google Meet', meetingLink:'', scheduledAt:'', durationMins:'30' })
  const [saving,     setSaving]     = useState(false)

  // Outcome modal
  const [outModal,   setOutModal]   = useState(null)
  const [outForm,    setOutForm]    = useState({ outcome:'', outcomeNotes:'', nextActionDate:'' })

  // Reschedule modal
  const [rescModal,  setRescModal]  = useState(null)
  const [rescForm,   setRescForm]   = useState({ scheduledAt:'', reason:'' })

  // Fetch my TeamMember _id once
  useEffect(() => {
    if (user?.role === 'team_member') {
      api.get('/team-members/me')
        .then(r => setMyMemberId(r.data._id))
        .catch(() => {})
    }
  }, [user])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterStatus) params.status = filterStatus
      const [mR, lR] = await Promise.all([
        api.get('/team-members/my-meetings', { params }),
        api.get('/team-members/my-leads'),
      ])
      setMeetings(mR.data)
      setLeads(lR.data)
    } catch {
      toast.error('Failed to load meetings')
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { load() }, [load])

  // Pre-fill from My Leads "📅 Meeting" button
  useEffect(() => {
    if (prefillLead) {
      setSchedForm(p => ({
        ...p,
        leadId: prefillLead._id,
        topic: `Meeting with ${prefillLead.clientName}`,
      }))
      setShowSched(true)
      onClearPrefill?.()
    }
  }, [prefillLead])

  const sf = k => e => setSchedForm(p => ({ ...p, [k]: e.target.value }))

  // ── Schedule submit ───────────────────────────────────────────
  const submitSchedule = async e => {
    e.preventDefault()
    if (!schedForm.leadId) { toast.error('Please select a lead'); return }
    if (!schedForm.scheduledAt) { toast.error('Please select date & time'); return }
    setSaving(true)
    try {
      await api.post('/meetings', {
        leadId:        schedForm.leadId,
        teamMemberId:  myMemberId || undefined,
        meetingType:   schedForm.meetingType,
        platform:      schedForm.platform,
        topic:         schedForm.topic,
        meetingLink:   schedForm.meetingLink || '',
        scheduledAt:   schedForm.scheduledAt,
        durationMins:  Number(schedForm.durationMins) || 30,
      })
      toast.success('Meeting scheduled! ✅')
      setShowSched(false)
      setSchedForm({ leadId:'', topic:'', meetingType:'Online', platform:'Google Meet', meetingLink:'', scheduledAt:'', durationMins:'30' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule')
    } finally {
      setSaving(false)
    }
  }

  // ── Outcome submit ────────────────────────────────────────────
  const submitOutcome = async e => {
    e.preventDefault()
    if (!outForm.outcome) { toast.error('Please select an outcome'); return }
    setSaving(true)
    try {
      await api.put(`/team-members/meetings/${outModal._id}/complete`, {
        outcome:        outForm.outcome,
        outcomeNotes:   outForm.outcomeNotes,
        nextActionDate: outForm.nextActionDate || null,
      })
      toast.success('Outcome saved ✅')
      setOutModal(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // ── Reschedule submit ─────────────────────────────────────────
  const submitReschedule = async e => {
    e.preventDefault()
    if (!rescForm.scheduledAt) { toast.error('Please select new date & time'); return }
    setSaving(true)
    try {
      await api.put(`/team-members/meetings/${rescModal._id}/reschedule`, {
        newScheduledDate: rescForm.scheduledAt,
        rescheduleReason: rescForm.reason,
      })
      toast.success('Meeting rescheduled 🔄')
      setRescModal(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reschedule')
    } finally {
      setSaving(false)
    }
  }

  const fmtDT = d => d ? new Date(d).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'
  const fmtD  = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—'

  return (
    <div className="space-y-4 pb-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">My Meetings</h2>
          <p className="text-sm text-gray-500">Schedule and track client meetings</p>
        </div>
        <button onClick={() => { setSchedForm({ leadId:'', topic:'', meetingType:'Online', platform:'Google Meet', meetingLink:'', scheduledAt:'', durationMins:'30' }); setShowSched(true) }}
          className="dp-btn dp-btn-primary gap-1.5 text-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14"/></svg>
          Schedule Meeting
        </button>
      </div>

      {/* ── Status filter cards ── */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {STATUSES.map(s => {
          const m   = STATUS_META[s]
          const cnt = meetings.filter(x => (isOverdue(x) ? 'Overdue' : x.status) === s).length
          return (
            <button key={s} onClick={() => setFS(filterStatus === s ? '' : s)}
              className={`rounded-xl border p-2.5 text-center transition hover:shadow-md ${filterStatus === s ? 'ring-2 ring-blue-300' : ''}`}
              style={{ background: filterStatus === s ? m.bg : 'white', borderColor: filterStatus === s ? m.border : '#e5e7eb' }}>
              <p className="text-lg">{m.icon}</p>
              <p className="text-lg font-extrabold" style={{ color: m.text }}>{cnt}</p>
              <p className="text-[9px] text-gray-500 font-semibold leading-tight mt-0.5">{s}</p>
            </button>
          )
        })}
      </div>

      {/* ── Meeting list ── */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />)}</div>
      ) : meetings.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-blue-100 py-14 text-center">
          <p className="text-4xl mb-2">📅</p>
          <p className="font-bold text-gray-700">No meetings yet</p>
          <p className="text-sm text-gray-400 mt-1">Tap "Schedule Meeting" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((m, i) => {
            const overdue  = isOverdue(m)
            const upcoming = isUpcoming(m)
            const displayStatus = overdue ? 'Overdue' : m.status
            const sm  = STATUS_META[displayStatus] || STATUS_META.Pending
            const om  = m.outcome ? (OUTCOME_META[m.outcome] || {}) : null
            const waLink = buildWA(m)

            return (
              <motion.div key={m._id} layout
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-white rounded-2xl border overflow-hidden transition ${
                  overdue   ? 'border-red-200 shadow-red-50 shadow-md' :
                  upcoming  ? 'border-amber-200 shadow-amber-50 shadow-md' :
                  'border-gray-100 shadow-sm'
                }`}>

                {/* Status bar top */}
                <div className="h-1" style={{ background: sm.text }} />

                <div className="p-4 space-y-3">
                  {/* Title row */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg border"
                      style={{ background: sm.bg, borderColor: sm.border }}>
                      {sm.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <span className="font-extrabold text-gray-900 text-sm leading-tight">{m.topic}</span>
                        {upcoming && <span className="rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold px-2 py-0.5 animate-pulse">Soon</span>}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="dp-pill text-[10px] font-bold" style={{ background: sm.bg, color: sm.text, border: `1px solid ${sm.border}` }}>
                          {displayStatus}
                        </span>
                        {m.outcome && om.bg && (
                          <span className="dp-pill text-[10px] font-bold" style={{ background: om.bg, color: om.text }}>
                            {m.outcome}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
                    <span>👤 {m.leadName || (typeof m.leadId === 'object' ? m.leadId?.clientName : '') || '—'}</span>
                    <span>{PLATFORM_ICONS[m.platform] || '🌐'} {m.platform}</span>
                    <span>📅 {fmtDT(m.scheduledAt)}</span>
                    <span>⏱ {m.durationMins} min</span>
                    {m.meetingType && <span>{m.meetingType === 'Online' ? '💻' : '🏢'} {m.meetingType}</span>}
                    {m.leadContact && <span>📞 {m.leadContact}</span>}
                  </div>

                  {/* Meeting link */}
                  {m.meetingLink && (
                    <a href={m.meetingLink} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline bg-blue-50 rounded-xl px-3 py-2">
                      🔗 Join Meeting Link ↗
                    </a>
                  )}

                  {/* Outcome notes */}
                  {m.outcomeNotes && (
                    <p className="text-xs text-gray-500 italic bg-gray-50 rounded-xl px-3 py-2">"{m.outcomeNotes}"</p>
                  )}
                  {m.nextActionDate && (
                    <p className="text-xs text-blue-600 font-semibold">🗓 Next action: {fmtD(m.nextActionDate)}</p>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
                    {/* WhatsApp */}
                    {waLink && (m.status === 'Pending' || overdue) && (
                      <a href={waLink} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-xl bg-green-500 text-white text-xs font-bold px-3 py-2 hover:bg-green-600 transition no-underline">
                        📲 Send WhatsApp
                      </a>
                    )}
                    {/* Mark Done */}
                    {(m.status === 'Pending' || overdue) && (
                      <button onClick={() => { setOutForm({ outcome:'', outcomeNotes:'', nextActionDate:'' }); setOutModal(m) }}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold px-3 py-2 hover:bg-blue-700 transition">
                        ✅ Mark as Done
                      </button>
                    )}
                    {/* Reschedule */}
                    {(overdue || m.status === 'Pending') && (
                      <button onClick={() => { setRescForm({ scheduledAt:'', reason:'' }); setRescModal(m) }}
                        className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-2 hover:bg-amber-100 transition">
                        🔄 Reschedule
                      </button>
                    )}
                    {/* Edit outcome */}
                    {m.status === 'Completed' && (
                      <button onClick={() => { setOutForm({ outcome: m.outcome||'', outcomeNotes: m.outcomeNotes||'', nextActionDate: m.nextActionDate ? m.nextActionDate.split('T')[0] : '' }); setOutModal(m) }}
                        className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-xs font-bold px-3 py-2 hover:bg-gray-100 transition">
                        ✏️ Edit Outcome
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ══ SCHEDULE MEETING MODAL ══ */}
      <AnimatePresence>
        {showSched && (
          <Modal open title="Schedule Meeting" onClose={() => setShowSched(false)} maxW="max-w-lg">
            <form onSubmit={submitSchedule} className="space-y-4">
              <FRow label="Lead / Client" required>
                <select value={schedForm.leadId} onChange={sf('leadId')} required className="dp-input bg-white">
                  <option value="">— Select Lead —</option>
                  {leads.map(l => <option key={l._id} value={l._id}>{l.clientName} · {l.contact}</option>)}
                </select>
              </FRow>
              <FRow label="Topic" required>
                <input value={schedForm.topic} onChange={sf('topic')} required placeholder="e.g. Course Demo, Follow-up" className="dp-input" />
              </FRow>
              <div className="grid grid-cols-2 gap-3">
                <FRow label="Type">
                  <select value={schedForm.meetingType} onChange={sf('meetingType')} className="dp-input bg-white">
                    <option>Online</option><option>Onsite</option>
                  </select>
                </FRow>
                <FRow label="Platform">
                  <select value={schedForm.platform} onChange={sf('platform')} className="dp-input bg-white">
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </FRow>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FRow label="Date & Time" required>
                  <input type="datetime-local" value={schedForm.scheduledAt} onChange={sf('scheduledAt')} required className="dp-input" />
                </FRow>
                <FRow label="Duration (min)">
                  <input type="number" value={schedForm.durationMins} onChange={sf('durationMins')} min={5} max={480} className="dp-input" />
                </FRow>
              </div>
              <FRow label="Meeting Link (Zoom / Google Meet)">
                <input value={schedForm.meetingLink} onChange={sf('meetingLink')} placeholder="Paste invite link here (optional)" className="dp-input" />
                <p className="text-[11px] text-gray-400 mt-0.5">Create meeting on Zoom/Google Meet → copy link → paste here</p>
              </FRow>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowSched(false)} className="flex-1 dp-btn dp-btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 dp-btn dp-btn-primary">
                  {saving ? 'Scheduling…' : '📅 Schedule Meeting'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* ══ OUTCOME MODAL ══ */}
      <AnimatePresence>
        {outModal && (
          <Modal open title="Meeting Outcome" subtitle={`"${outModal.topic}"`} onClose={() => setOutModal(null)}>
            <form onSubmit={submitOutcome} className="space-y-4">
              <FRow label="Outcome" required>
                <div className="grid grid-cols-2 gap-2">
                  {OUTCOMES.map(o => {
                    const meta = OUTCOME_META[o] || {}
                    const selected = outForm.outcome === o
                    return (
                      <button key={o} type="button" onClick={() => setOutForm(p => ({ ...p, outcome: o }))}
                        className={`rounded-xl border px-3 py-2.5 text-xs font-bold text-left transition ${selected ? 'ring-2 ring-offset-1 ring-blue-400' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
                        style={selected ? { background: meta.bg, color: meta.text, borderColor: meta.text } : {}}>
                        {o}
                      </button>
                    )
                  })}
                </div>
              </FRow>
              <FRow label="Notes">
                <textarea value={outForm.outcomeNotes} onChange={e => setOutForm(p => ({ ...p, outcomeNotes: e.target.value }))}
                  rows={3} placeholder="What happened in the meeting?" className="dp-input resize-none" />
              </FRow>
              <FRow label="Next Action Date">
                <input type="date" value={outForm.nextActionDate} onChange={e => setOutForm(p => ({ ...p, nextActionDate: e.target.value }))} className="dp-input" />
              </FRow>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOutModal(null)} className="flex-1 dp-btn dp-btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 dp-btn dp-btn-primary" style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>
                  {saving ? 'Saving…' : '✅ Save Outcome'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* ══ RESCHEDULE MODAL ══ */}
      <AnimatePresence>
        {rescModal && (
          <Modal open title="Reschedule Meeting" subtitle={`"${rescModal.topic}"`} onClose={() => setRescModal(null)}>
            <form onSubmit={submitReschedule} className="space-y-4">
              <FRow label="New Date & Time" required>
                <input type="datetime-local" value={rescForm.scheduledAt} onChange={e => setRescForm(p => ({ ...p, scheduledAt: e.target.value }))} required className="dp-input" />
              </FRow>
              <FRow label="Reason (optional)">
                <textarea value={rescForm.reason} onChange={e => setRescForm(p => ({ ...p, reason: e.target.value }))}
                  rows={2} placeholder="Why are you rescheduling?" className="dp-input resize-none" />
              </FRow>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setRescModal(null)} className="flex-1 dp-btn dp-btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 dp-btn dp-btn-primary" style={{ background: 'linear-gradient(135deg,#d97706,#b45309)' }}>
                  {saving ? 'Saving…' : '🔄 Reschedule'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}
