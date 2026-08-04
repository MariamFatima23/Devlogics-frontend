import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const SOURCES  = ['Facebook','Instagram','Website','Referral','Walk-in','WhatsApp','LinkedIn','Other']
const STATUSES = ['New','Assigned','In Progress','Converted','Lost']
const GRADES   = ['Diamond','Silver','Bronze','Ungraded']

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
const SOURCE_ICONS = { Facebook:'📘',Instagram:'📸',Website:'🌐',Referral:'🤝','Walk-in':'🚶',WhatsApp:'💬',LinkedIn:'💼',Other:'📌' }
const EMPTY_FORM = { clientName:'',contact:'',email:'',source:'Facebook',purpose:'',notes:'',grade:'Ungraded' }

/* ── shared form field ── */
function Field({ label, value, onChange, type='text', required=false, placeholder='', as='input', rows=2 }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="dp-label-text">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {as === 'textarea'
        ? <textarea value={value} onChange={onChange} rows={rows} placeholder={placeholder}
            className="dp-input resize-none" />
        : <input type={type} value={value} onChange={onChange} required={required} placeholder={placeholder}
            className="dp-input" />
      }
    </div>
  )
}

function SelectField({ label, value, onChange, options, required=false }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="dp-label-text">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <select value={value} onChange={onChange} required={required}
        className="dp-input bg-white">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

/* ── Modal shell ── */
function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background:'rgba(3,4,94,0.55)', backdropFilter:'blur(4px)' }} onClick={onClose}>
      <motion.div initial={{ scale:0.94, opacity:0 }} animate={{ scale:1, opacity:1 }}
        exit={{ scale:0.94, opacity:0 }} transition={{ type:'spring', stiffness:340, damping:28 }}
        className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="h-1" style={{ background:'linear-gradient(90deg,#04065c,#48cae4)' }} />
        {children}
      </motion.div>
    </div>
  )
}

/* ── Assign Modal ── */
function AssignModal({ lead, teamMembers, existingAssignments, onClose, onDone }) {
  const [selected, setSelected] = useState(existingAssignments.map(a => a.teamMemberId?._id || a.teamMemberId))
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const toggle = id => setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])

  const save = async () => {
    const newOnes = selected.filter(id => !existingAssignments.some(a=>(a.teamMemberId?._id||a.teamMemberId)===id))
    if (!newOnes.length) { toast('No new assignments'); return }
    setSaving(true)
    try {
      await api.post(`/leads/${lead._id}/assign`, { teamMemberIds: newOnes, note })
      toast.success('Assigned!'); onDone()
    } catch(e) { toast.error(e.response?.data?.message||'Error') }
    finally { setSaving(false) }
  }

  const removeA = async (aId) => {
    try { await api.delete(`/leads/assignments/${aId}`); toast.success('Removed'); onDone() }
    catch { toast.error('Error') }
  }

  return (
    <Modal open onClose={onClose}>
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-extrabold text-gray-900">Assign Lead</h3>
        <p className="text-sm text-gray-500 -mt-2">{lead.clientName}</p>

        {existingAssignments.length > 0 && (
          <div>
            <p className="dp-label-text mb-2">Currently Assigned</p>
            <div className="flex flex-wrap gap-2">
              {existingAssignments.map(a => (
                <span key={a._id} className="flex items-center gap-1.5 rounded-full bg-primary-pale text-primary-blue px-3 py-1 text-xs font-semibold">
                  {a.teamMemberId?.name || a.teamMemberName}
                  <button onClick={()=>removeA(a._id)} className="hover:text-red-500 transition">✕</button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="dp-label-text mb-2">Select Team Members</p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {teamMembers.filter(m=>m.status==='Active').map(m => {
              const already = existingAssignments.some(a=>(a.teamMemberId?._id||a.teamMemberId)===m._id)
              const isSel   = selected.includes(m._id)
              return (
                <button key={m._id} onClick={()=>!already && toggle(m._id)} disabled={already}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm text-left transition ${
                    already ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' :
                    isSel   ? 'border-primary-blue bg-primary-pale text-primary-blue' :
                              'border-gray-100 bg-white hover:bg-gray-50'
                  }`}>
                  <span className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 ${isSel||already ? 'border-primary-blue bg-primary-blue' : 'border-gray-300'}`}>
                    {(isSel||already) && <span className="text-[9px] text-white font-bold">✓</span>}
                  </span>
                  <span className="flex-1 font-semibold">{m.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{m.role}</span>
                  {already && <span className="text-xs text-green-600">Assigned</span>}
                </button>
              )
            })}
          </div>
        </div>

        <Field label="Note (optional)" value={note} onChange={e=>setNote(e.target.value)} placeholder="Assignment note..." />

        <div className="flex gap-3 justify-end pt-1">
          <button onClick={onClose} className="dp-btn dp-btn-outline">Cancel</button>
          <button onClick={save} disabled={saving} className="dp-btn dp-btn-primary">
            {saving ? 'Saving…' : 'Assign'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ══════════════════════════════════════════ */
export default function CrmLeads() {
  const [leads, setLeads]         = useState([])
  const [teamMembers, setTeam]    = useState([])
  const [loading, setLoading]     = useState(true)
  const [filterStatus, setFS]     = useState('')
  const [filterGrade, setFG]      = useState('')
  const [filterSource, setFSrc]   = useState('')
  const [search, setSearch]       = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [editLead, setEditLead]   = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [assignLead, setAssignLead] = useState(null)
  const [expanded, setExpanded]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterStatus) params.status = filterStatus
      if (filterGrade)  params.grade  = filterGrade
      if (filterSource) params.source = filterSource
      if (search)       params.search = search
      const [lR, tR] = await Promise.all([
        api.get('/leads', { params }),
        api.get('/team-members'),
      ])
      setLeads(lR.data); setTeam(tR.data)
    } catch { toast.error('Failed to load leads') }
    finally { setLoading(false) }
  }, [filterStatus, filterGrade, filterSource, search])

  useEffect(() => { load() }, [load])

  const openAdd  = () => { setForm(EMPTY_FORM); setEditLead(null); setShowForm(true) }
  const openEdit = (l) => { setForm({ clientName:l.clientName,contact:l.contact,email:l.email||'',source:l.source,purpose:l.purpose,notes:l.notes||'',grade:l.grade }); setEditLead(l); setShowForm(true) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editLead) { await api.put(`/leads/${editLead._id}`, form); toast.success('Updated') }
      else          { await api.post('/leads', form); toast.success('Lead added') }
      setShowForm(false); load()
    } catch(e) { toast.error(e.response?.data?.message||'Error') }
    finally { setSaving(false) }
  }

  const deleteLead = async (id) => {
    if (!window.confirm('Delete this lead?')) return
    try { await api.delete(`/leads/${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Error') }
  }

  const updateField = async (lead, patch) => {
    try { await api.put(`/leads/${lead._id}`, patch); load(); toast.success('Updated') }
    catch { toast.error('Error') }
  }

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">CRM Leads</h2>
          <p className="text-sm text-gray-500">Manage and track all your leads</p>
        </div>
        <button onClick={openAdd} className="dp-btn dp-btn-primary gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14"/></svg>
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, contact…"
          className="dp-input max-w-[220px]" />
        {[
          { val: filterStatus, set: setFS,   opts: STATUSES, placeholder: 'All Status' },
          { val: filterGrade,  set: setFG,   opts: GRADES,   placeholder: 'All Grades' },
          { val: filterSource, set: setFSrc, opts: SOURCES,  placeholder: 'All Sources' },
        ].map((f,i) => (
          <select key={i} value={f.val} onChange={e=>f.set(e.target.value)} className="dp-input w-auto bg-white">
            <option value="">{f.placeholder}</option>
            {f.opts.map(o=><option key={o}>{o}</option>)}
          </select>
        ))}
        {(filterStatus||filterGrade||filterSource||search) &&
          <button onClick={()=>{setFS('');setFG('');setFSrc('');setSearch('')}}
            className="dp-btn dp-btn-outline text-xs">Clear ✕</button>}
      </div>

      {/* Status stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATUSES.map(s => {
          const m = STATUS_META[s]; const cnt = leads.filter(l=>l.status===s).length
          return (
            <button key={s} onClick={()=>setFS(filterStatus===s?'':s)}
              className={`dp-stat-card text-center transition hover:shadow-md ${filterStatus===s ? 'ring-2 ring-primary-blue/40' : ''}`}
              style={filterStatus===s ? { borderColor: m.border, background: m.bg } : {}}>
              <p className="text-2xl font-extrabold" style={{ color: m.text }}>{cnt}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-semibold">{s}</p>
            </button>
          )
        })}
      </div>

      {/* Leads list */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100"/>)}</div>
      ) : leads.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-primary-pale py-16 text-center">
          <p className="text-4xl mb-2">📋</p>
          <p className="font-bold text-gray-700">No leads found</p>
          <p className="text-sm text-gray-400 mt-1">Add your first lead to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead,i) => {
            const gm  = GRADE_META[lead.grade] || GRADE_META.Ungraded
            const sm  = STATUS_META[lead.status] || {}
            const isEx = expanded === lead._id
            return (
              <motion.div key={lead._id} layout initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.03 }}
                className="dp-card overflow-hidden">
                <div className="flex flex-wrap items-start gap-3 p-4">
                  {/* Grade badge */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl border"
                    style={{ background: gm.bg, borderColor: gm.border }}>{gm.icon}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-extrabold text-gray-900 text-sm">{lead.clientName}</h3>
                      <span className="dp-pill text-[11px] font-bold" style={{ background:gm.bg, color:gm.text, border:`1px solid ${gm.border}` }}>
                        {lead.grade}
                      </span>
                      <span className="dp-pill text-[11px] font-bold" style={{ background:sm.bg, color:sm.text, border:`1px solid ${sm.border}` }}>
                        {lead.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                      <span>📞 {lead.contact}</span>
                      {lead.email && <span>✉️ {lead.email}</span>}
                      <span>{SOURCE_ICONS[lead.source]||'📌'} {lead.source}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 line-clamp-1">{lead.purpose}</p>
                    {lead.assignments?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {lead.assignments.map(a => (
                          <span key={a._id} className="rounded-full bg-primary-pale text-primary-blue px-2.5 py-0.5 text-xs font-semibold">
                            👤 {a.teamMemberId?.name || a.teamMemberName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button onClick={()=>setExpanded(isEx?null:lead._id)}
                      className="dp-btn dp-btn-outline text-xs px-2.5 py-1.5">{isEx?'▲':'▼'}</button>
                    <button onClick={()=>setAssignLead(lead)}
                      className="dp-btn dp-btn-outline text-xs px-2.5 py-1.5 border-primary-blue text-primary-blue">Assign</button>
                    <button onClick={()=>openEdit(lead)}
                      className="dp-btn dp-btn-outline text-xs px-2.5 py-1.5">Edit</button>
                    <button onClick={()=>deleteLead(lead._id)}
                      className="dp-btn dp-btn-danger text-xs px-2.5 py-1.5">✕</button>
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isEx && (
                    <motion.div initial={{ height:0 }} animate={{ height:'auto' }} exit={{ height:0 }}
                      className="overflow-hidden border-t border-gray-100">
                      <div className="p-4 bg-gray-50 space-y-4">
                        {lead.notes && (
                          <div>
                            <p className="dp-label-text mb-1">Notes</p>
                            <p className="text-sm text-gray-700">{lead.notes}</p>
                          </div>
                        )}
                        <div>
                          <p className="dp-label-text mb-1">Purpose / Interest</p>
                          <p className="text-sm text-gray-700">{lead.purpose}</p>
                        </div>
                        {/* Status update */}
                        <div>
                          <p className="dp-label-text mb-2">Update Status</p>
                          <div className="flex flex-wrap gap-2">
                            {STATUSES.map(s => {
                              const m = STATUS_META[s]
                              return (
                                <button key={s} onClick={()=>updateField(lead,{status:s})}
                                  className="rounded-full px-3 py-1 text-xs font-bold border transition"
                                  style={{ background:lead.status===s?m.bg:'white', color:lead.status===s?m.text:'#64748b', borderColor:lead.status===s?m.border:'#e2e8f0' }}>
                                  {s}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        {/* Grade update */}
                        <div>
                          <p className="dp-label-text mb-2">Update Grade</p>
                          <div className="flex flex-wrap gap-2">
                            {GRADES.map(g => {
                              const m = GRADE_META[g]
                              return (
                                <button key={g} onClick={()=>updateField(lead,{grade:g})}
                                  className="rounded-full px-3 py-1 text-xs font-bold border transition"
                                  style={{ background:lead.grade===g?m.bg:'white', color:lead.grade===g?m.text:'#64748b', borderColor:lead.grade===g?m.border:'#e2e8f0' }}>
                                  {m.icon} {g}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">Added {new Date(lead.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</p>
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
          <Modal open onClose={()=>setShowForm(false)}>
            <div className="p-6 max-h-[88vh] overflow-y-auto">
              <h3 className="text-lg font-extrabold text-gray-900 mb-5">{editLead?'Edit Lead':'Add New Lead'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Client Name" value={form.clientName} onChange={f('clientName')} required placeholder="Full name" />
                  <Field label="Contact / Phone" value={form.contact} onChange={f('contact')} required placeholder="Phone number" />
                </div>
                <Field label="Email" value={form.email} onChange={f('email')} type="email" placeholder="Optional" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField label="Source" value={form.source} onChange={f('source')} options={SOURCES} required />
                  <SelectField label="Grade" value={form.grade} onChange={f('grade')} options={GRADES} />
                </div>
                <Field as="textarea" label="Purpose / Interest" value={form.purpose} onChange={f('purpose')} required placeholder="What are they interested in?" rows={2} />
                <Field as="textarea" label="Notes" value={form.notes} onChange={f('notes')} placeholder="Optional notes…" rows={2} />
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={()=>setShowForm(false)} className="dp-btn dp-btn-outline">Cancel</button>
                  <button type="submit" disabled={saving} className="dp-btn dp-btn-primary">
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
          <AssignModal lead={assignLead} teamMembers={teamMembers}
            existingAssignments={assignLead.assignments||[]}
            onClose={()=>setAssignLead(null)}
            onDone={()=>{ setAssignLead(null); load() }} />
        )}
      </AnimatePresence>
    </div>
  )
}
