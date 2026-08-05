import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const STATUS_META = {
  Pending:     { bg:'#fffbeb', text:'#d97706', border:'#fde68a', icon:'⏳' },
  Completed:   { bg:'#f0fdf4', text:'#059669', border:'#a7f3d0', icon:'✅' },
  Rescheduled: { bg:'#eff6ff', text:'#2563eb', border:'#bfdbfe', icon:'🔄' },
  Cancelled:   { bg:'#f8fafc', text:'#64748b', border:'#e2e8f0', icon:'❌' },
  Overdue:     { bg:'#fff1f2', text:'#dc2626', border:'#fecaca', icon:'🚨' },
}
const OUTCOME_META = {
  Interested:           { bg:'#f0fdf4', text:'#059669' },
  'Not Interested':     { bg:'#fff1f2', text:'#dc2626' },
  Objection:            { bg:'#fffbeb', text:'#d97706' },
  'Follow-up Required': { bg:'#eff6ff', text:'#2563eb' },
  Converted:            { bg:'#f5f3ff', text:'#7c3aed' },
  'No Show':            { bg:'#f8fafc', text:'#64748b' },
}
const PLATFORM_ICONS = { 'Google Meet':'🟢','Zoom':'🔵','Phone Call':'📞','In-Person':'🏢','Microsoft Teams':'🟣','Other':'🌐' }
const OUTCOMES = ['Interested','Not Interested','Objection','Follow-up Required','Converted','No Show']
const STATUSES = ['Pending','Completed','Rescheduled','Cancelled','Overdue']

// Build WhatsApp wa.me link
function buildWhatsAppLink(meeting) {
  const lead = meeting.leadId
  const phone = typeof lead === 'object' ? lead?.contact : ''
  if (!phone) return null
  const cleaned = phone.replace(/[\s\-()]/g, '').replace(/^0/, '92')
  const date = meeting.scheduledAt
    ? new Date(meeting.scheduledAt).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
    : ''
  const name = typeof lead === 'object' ? lead?.clientName : 'Client'
  let msg = `Hello ${name},\n\nYour meeting has been scheduled:\n📅 Date & Time: ${date}\n⏱ Duration: ${meeting.durationMins} min\n📋 Topic: ${meeting.topic}`
  if (meeting.meetingLink) msg += `\n🔗 Meeting Link: ${meeting.meetingLink}`
  msg += `\n\nPlease join on time. Thank you!`
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(msg)}`
}

function Modal({ open, onClose, children, maxW='max-w-md' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background:'rgba(3,4,94,0.55)', backdropFilter:'blur(4px)' }} onClick={onClose}>
      <motion.div initial={{ scale:0.94, opacity:0 }} animate={{ scale:1, opacity:1 }}
        exit={{ scale:0.94, opacity:0 }} transition={{ type:'spring', stiffness:340, damping:28 }}
        className={`relative w-full ${maxW} rounded-3xl bg-white shadow-2xl overflow-hidden`}
        onClick={e=>e.stopPropagation()}>
        <div className="h-1" style={{ background:'linear-gradient(90deg,#04065c,#48cae4)' }}/>
        {children}
      </motion.div>
    </div>
  )
}

export default function TeamMyMeetings({ prefillLead, onClearPrefill }) {
  const [meetings, setMeetings]   = useState([])
  const [leads, setLeads]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [filterStatus, setFS]     = useState('')
  const [showSchedule, setShowSched] = useState(false)
  const [schedForm, setSF]        = useState({ leadId:'', topic:'', meetingType:'Online', platform:'Google Meet', meetingLink:'', scheduledAt:'', durationMins:'30' })
  const [saving, setSaving]       = useState(false)
  const [outcomeModal, setOM]     = useState(null)
  const [outcomeForm, setOF]      = useState({ status:'Completed', outcome:'', outcomeNotes:'', nextActionDate:'' })
  const [reschedModal, setRM]     = useState(null)
  const [reschedForm, setRF]      = useState({ scheduledAt:'', rescheduleReason:'' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}; if (filterStatus) params.status = filterStatus
      const [mR, lR] = await Promise.all([
        api.get('/team-members/my-meetings', { params }),
        api.get('/team-members/my-leads'),
      ])
      setMeetings(mR.data); setLeads(lR.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }, [filterStatus])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (prefillLead) {
      setSF(p=>({ ...p, leadId:prefillLead._id, topic:`Meeting with ${prefillLead.clientName}` }))
      setShowSched(true)
      onClearPrefill && onClearPrefill()
    }
  }, [prefillLead])

  const sf = k => e => setSF(p=>({ ...p, [k]:e.target.value }))

  const submitSchedule = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/meetings', { leadId:schedForm.leadId, meetingType:schedForm.meetingType, platform:schedForm.platform, topic:schedForm.topic, meetingLink:schedForm.meetingLink||'', scheduledAt:schedForm.scheduledAt, durationMins:Number(schedForm.durationMins)||30 })
      toast.success('Meeting scheduled!'); setShowSched(false); load()
    } catch(e) { toast.error(e.response?.data?.message||'Error') }
    finally { setSaving(false) }
  }

  const submitOutcome = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.put(`/team-members/meetings/${outcomeModal._id}`, { status:outcomeForm.status, outcome:outcomeForm.outcome, outcomeNotes:outcomeForm.outcomeNotes, nextActionDate:outcomeForm.nextActionDate||null })
      toast.success('Saved'); setOM(null); load()
    } catch(e) { toast.error(e.response?.data?.message||'Error') }
    finally { setSaving(false) }
  }

  const submitReschedule = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.put(`/team-members/meetings/${reschedModal._id}`, { status:'Rescheduled', scheduledAt:reschedForm.scheduledAt, rescheduleReason:reschedForm.rescheduleReason })
      toast.success('Rescheduled'); setRM(null); load()
    } catch(e) { toast.error(e.response?.data?.message||'Error') }
    finally { setSaving(false) }
  }

  const fmtDT = d=>d?new Date(d).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'—'
  const fmtD  = d=>d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—'
  const isUpcoming = m=>{ const diff=new Date(m.scheduledAt)-new Date(); return m.status==='Pending'&&diff>0&&diff<86400000 }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">My Meetings</h2>
          <p className="text-sm text-gray-500">Track and manage your client meetings</p>
        </div>
        <button onClick={()=>{ setSF({ leadId:'',topic:'',meetingType:'Online',platform:'Google Meet',meetingLink:'',scheduledAt:'',durationMins:'30' }); setShowSched(true) }}
          className="dp-btn dp-btn-primary gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14"/></svg>
          Schedule
        </button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATUSES.map(s=>{
          const m=STATUS_META[s]; const cnt=meetings.filter(x=>x.status===s).length
          return (
            <button key={s} onClick={()=>setFS(filterStatus===s?'':s)}
              className={`dp-stat-card text-center transition hover:shadow-md ${filterStatus===s?'ring-2 ring-primary-blue/40':''}`}
              style={filterStatus===s?{background:m.bg,borderColor:m.border}:{}}>
              <p className="text-xl">{m.icon}</p>
              <p className="text-2xl font-extrabold mt-0.5" style={{ color:m.text }}>{cnt}</p>
              <p className="text-[10px] text-gray-500 font-semibold leading-tight">{s}</p>
            </button>
          )
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100"/>)}</div>
      ) : meetings.length===0 ? (
        <div className="rounded-2xl border-2 border-dashed border-primary-pale py-16 text-center">
          <p className="text-4xl mb-2">📅</p>
          <p className="font-bold text-gray-700">No meetings yet</p>
          <p className="text-sm text-gray-400 mt-1">Schedule your first meeting!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((m,i)=>{
            const sm=STATUS_META[m.status]||STATUS_META.Pending
            const om=m.outcome?(OUTCOME_META[m.outcome]||{}):null
            const upcoming=isUpcoming(m)
            return (
              <motion.div key={m._id} layout initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.03 }}
                className={`dp-card overflow-hidden ${upcoming?'ring-2 ring-amber-300':''}`}>
                <div className="flex flex-wrap items-start gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl border"
                    style={{ background:sm.bg, borderColor:sm.border }}>{sm.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-extrabold text-gray-900 text-sm">{m.topic}</h3>
                      {upcoming && <span className="dp-pill bg-amber-100 text-amber-700 animate-pulse text-[10px]">Soon</span>}
                      <span className="dp-pill text-[11px] font-bold" style={{ background:sm.bg, color:sm.text, border:`1px solid ${sm.border}` }}>{m.status}</span>
                      {m.outcome&&om && <span className="dp-pill text-[11px] font-bold" style={{ background:om.bg, color:om.text }}>{m.outcome}</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                      {m.leadId && <span>👤 {m.leadId.clientName||'Client'}</span>}
                      <span>{PLATFORM_ICONS[m.platform]||'🌐'} {m.platform}</span>
                      <span>📅 {fmtDT(m.scheduledAt)}</span>
                      <span>⏱ {m.durationMins} min</span>
                    </div>
                    {m.meetingLink && (
                      <a href={m.meetingLink} target="_blank" rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-primary-blue hover:underline font-semibold">
                        🔗 Join Meeting Link ↗
                      </a>
                    )}
                    {m.outcomeNotes && <p className="mt-1 text-xs text-gray-400 italic line-clamp-1">"{m.outcomeNotes}"</p>}
                    {m.nextActionDate && <p className="mt-1 text-xs text-primary-blue font-semibold">🗓 Next: {fmtD(m.nextActionDate)}</p>}
                  </div>
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    {/* WhatsApp button */}
                    {(m.status==='Pending'||m.status==='Overdue') && buildWhatsAppLink(m) && (
                      <a href={buildWhatsAppLink(m)} target="_blank" rel="noreferrer"
                        className="dp-btn text-xs px-2.5 py-1.5 bg-green-500 text-white hover:bg-green-600 border-0 no-underline">
                        📲 WhatsApp
                      </a>
                    )}
                    {(m.status==='Pending'||m.status==='Overdue') && <>
                      <button onClick={()=>{ setOF({ status:'Completed', outcome:'', outcomeNotes:'', nextActionDate:'' }); setOM(m) }}
                        className="dp-btn text-xs px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100">✅ Done</button>
                      <button onClick={()=>{ setRF({ scheduledAt:'', rescheduleReason:'' }); setRM(m) }}
                        className="dp-btn text-xs px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100">🔄</button>
                    </>}
                    {m.status==='Completed' && (
                      <button onClick={()=>{ setOF({ status:'Completed', outcome:m.outcome||'', outcomeNotes:m.outcomeNotes||'', nextActionDate:m.nextActionDate?m.nextActionDate.split('T')[0]:'' }); setOM(m) }}
                        className="dp-btn dp-btn-outline text-xs px-2.5 py-1.5">✏️ Edit</button>
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
          <Modal open onClose={()=>setShowSched(false)} maxW="max-w-lg">
            <div className="p-6 max-h-[88vh] overflow-y-auto">
              <h3 className="text-lg font-extrabold text-gray-900 mb-5">Schedule Meeting</h3>
              <form onSubmit={submitSchedule} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="dp-label-text">Lead <span className="text-red-500">*</span></label>
                  <select value={schedForm.leadId} onChange={sf('leadId')} required className="dp-input bg-white">
                    <option value="">— Select Lead —</option>
                    {leads.map(l=><option key={l._id} value={l._id}>{l.clientName} ({l.contact})</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="dp-label-text">Topic <span className="text-red-500">*</span></label>
                  <input value={schedForm.topic} onChange={sf('topic')} required placeholder="e.g. Course Enquiry, Demo" className="dp-input"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="dp-label-text">Type</label>
                    <select value={schedForm.meetingType} onChange={sf('meetingType')} className="dp-input bg-white">
                      <option>Online</option><option>Onsite</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="dp-label-text">Platform</label>
                    <select value={schedForm.platform} onChange={sf('platform')} className="dp-input bg-white">
                      {['Google Meet','Zoom','Phone Call','In-Person','Microsoft Teams','Other'].map(p=><option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="dp-label-text">Date & Time <span className="text-red-500">*</span></label>
                    <input type="datetime-local" value={schedForm.scheduledAt} onChange={sf('scheduledAt')} required className="dp-input"/>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="dp-label-text">Duration (min)</label>
                    <input type="number" value={schedForm.durationMins} onChange={sf('durationMins')} min={5} className="dp-input"/>
                  </div>
                </div>
                {/* Meeting Link */}
                <div className="flex flex-col gap-1">
                  <label className="dp-label-text">Meeting Link (Zoom / Google Meet)</label>
                  <input value={schedForm.meetingLink} onChange={sf('meetingLink')}
                    placeholder="Paste Zoom or Google Meet link here" className="dp-input"/>
                  <p className="text-[11px] text-gray-400 mt-0.5">Create a meeting on Zoom/Google Meet, copy the invite link and paste here.</p>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={()=>setShowSched(false)} className="dp-btn dp-btn-outline">Cancel</button>
                  <button type="submit" disabled={saving} className="dp-btn dp-btn-primary">{saving?'Saving…':'Schedule'}</button>
                </div>
              </form>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Outcome Modal */}
      <AnimatePresence>
        {outcomeModal && (
          <Modal open onClose={()=>setOM(null)}>
            <div className="p-6">
              <h3 className="text-lg font-extrabold text-gray-900 mb-1">Meeting Outcome</h3>
              <p className="text-sm text-gray-500 mb-4">"{outcomeModal.topic}"</p>
              <form onSubmit={submitOutcome} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="dp-label-text">Mark as</label>
                  <select value={outcomeForm.status} onChange={e=>setOF(p=>({...p,status:e.target.value}))} className="dp-input bg-white">
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="dp-label-text">Outcome</label>
                  <select value={outcomeForm.outcome} onChange={e=>setOF(p=>({...p,outcome:e.target.value}))} className="dp-input bg-white">
                    <option value="">— Select —</option>
                    {OUTCOMES.map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="dp-label-text">Notes</label>
                  <textarea value={outcomeForm.outcomeNotes} onChange={e=>setOF(p=>({...p,outcomeNotes:e.target.value}))}
                    rows={3} placeholder="What happened?" className="dp-input resize-none"/>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="dp-label-text">Next Action Date</label>
                  <input type="date" value={outcomeForm.nextActionDate} onChange={e=>setOF(p=>({...p,nextActionDate:e.target.value}))} className="dp-input"/>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={()=>setOM(null)} className="dp-btn dp-btn-outline">Cancel</button>
                  <button type="submit" disabled={saving} className="dp-btn dp-btn-primary" style={{ background:'linear-gradient(135deg,#059669,#047857)' }}>
                    {saving?'Saving…':'Save Outcome'}
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
          <Modal open onClose={()=>setRM(null)}>
            <div className="p-6">
              <h3 className="text-lg font-extrabold text-gray-900 mb-1">Reschedule Meeting</h3>
              <p className="text-sm text-gray-500 mb-4">"{reschedModal.topic}"</p>
              <form onSubmit={submitReschedule} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="dp-label-text">New Date & Time <span className="text-red-500">*</span></label>
                  <input type="datetime-local" value={reschedForm.scheduledAt} onChange={e=>setRF(p=>({...p,scheduledAt:e.target.value}))} required className="dp-input"/>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="dp-label-text">Reason</label>
                  <textarea value={reschedForm.rescheduleReason} onChange={e=>setRF(p=>({...p,rescheduleReason:e.target.value}))} rows={2} placeholder="Optional…" className="dp-input resize-none"/>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={()=>setRM(null)} className="dp-btn dp-btn-outline">Cancel</button>
                  <button type="submit" disabled={saving} className="dp-btn dp-btn-primary" style={{ background:'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>
                    {saving?'Saving…':'🔄 Reschedule'}
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
