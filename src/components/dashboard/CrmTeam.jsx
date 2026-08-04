import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const ROLES    = ['Sales','Marketing','Counselor','Manager','Support','Other']
const STATUSES = ['Active','Inactive']

const ROLE_META = {
  Sales:     { bg:'#f0fdf4', text:'#059669', border:'#a7f3d0', icon:'💰' },
  Marketing: { bg:'#fffbeb', text:'#d97706', border:'#fde68a', icon:'📣' },
  Counselor: { bg:'#eff6ff', text:'#2563eb', border:'#bfdbfe', icon:'🎓' },
  Manager:   { bg:'#f5f3ff', text:'#7c3aed', border:'#ddd6fe', icon:'👑' },
  Support:   { bg:'#fff1f2', text:'#dc2626', border:'#fecaca', icon:'🛠️' },
  Other:     { bg:'#f8fafc', text:'#64748b', border:'#e2e8f0', icon:'👤' },
}

const EMPTY = { name:'', email:'', phone:'', role:'Sales', status:'Active', password:'' }

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background:'rgba(3,4,94,0.55)', backdropFilter:'blur(4px)' }} onClick={onClose}>
      <motion.div initial={{ scale:0.94, opacity:0 }} animate={{ scale:1, opacity:1 }}
        exit={{ scale:0.94, opacity:0 }} transition={{ type:'spring', stiffness:340, damping:28 }}
        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden"
        onClick={e=>e.stopPropagation()}>
        <div className="h-1" style={{ background:'linear-gradient(90deg,#04065c,#48cae4)' }} />
        {children}
      </motion.div>
    </div>
  )
}

function Field({ label, value, onChange, type='text', required=false, placeholder='' }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="dp-label-text">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <input type={type} value={value} onChange={onChange} required={required} placeholder={placeholder}
        className="dp-input" />
    </div>
  )
}

export default function CrmTeam() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editMember, setEdit] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [saving, setSaving]   = useState(false)
  const [filterRole, setFR]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try { const { data } = await api.get('/team-members'); setMembers(data) }
    catch { toast.error('Failed to load team') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd  = () => { setForm(EMPTY); setEdit(null); setShowForm(true) }
  const openEdit = m => { setForm({ name:m.name, email:m.email||'', phone:m.phone||'', role:m.role, status:m.status, password:'' }); setEdit(m); setShowForm(true) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editMember) { await api.put(`/team-members/${editMember._id}`, form); toast.success('Updated') }
      else            { await api.post('/team-members', form); toast.success('Team member added') }
      setShowForm(false); load()
    } catch(e) { toast.error(e.response?.data?.message||'Error') }
    finally { setSaving(false) }
  }

  const deleteMember = async (id) => {
    if (!window.confirm('Delete this team member?')) return
    try { await api.delete(`/team-members/${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Error') }
  }

  const toggleStatus = async m => {
    try { await api.put(`/team-members/${m._id}`, { status: m.status==='Active'?'Inactive':'Active' }); load() }
    catch { toast.error('Error') }
  }

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const filtered = filterRole ? members.filter(m=>m.role===filterRole) : members

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">CRM Team</h2>
          <p className="text-sm text-gray-500">Manage your sales & marketing team</p>
        </div>
        <button onClick={openAdd} className="dp-btn dp-btn-primary gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14"/></svg>
          Add Member
        </button>
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {ROLES.map(role => {
          const m = ROLE_META[role]
          const cnt = members.filter(x=>x.role===role && x.status==='Active').length
          return (
            <button key={role} onClick={()=>setFR(filterRole===role?'':role)}
              className={`dp-stat-card text-center transition hover:shadow-md ${filterRole===role?'ring-2 ring-primary-blue/40':''}`}
              style={filterRole===role?{background:m.bg,borderColor:m.border}:{}}>
              <p className="text-xl mb-0.5">{m.icon}</p>
              <p className="text-lg font-extrabold" style={{ color:m.text }}>{cnt}</p>
              <p className="text-[10px] text-gray-500 font-semibold leading-tight">{role}</p>
            </button>
          )
        })}
      </div>

      {filterRole && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Showing: <strong>{filterRole}</strong></span>
          <button onClick={()=>setFR('')} className="text-xs text-primary-blue hover:underline">Clear ✕</button>
        </div>
      )}

      {/* Team grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i=><div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-primary-pale py-16 text-center">
          <p className="text-4xl mb-2">👥</p>
          <p className="font-bold text-gray-700">No team members yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first team member to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m,i) => {
            const rm = ROLE_META[m.role] || ROLE_META.Other
            return (
              <motion.div key={m._id} layout initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                className="dp-card p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl border"
                    style={{ background:rm.bg, borderColor:rm.border }}>{rm.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-gray-900 truncate">{m.name}</h3>
                    <span className="dp-pill mt-0.5 text-[11px] font-bold" style={{ background:rm.bg, color:rm.text, border:`1px solid ${rm.border}` }}>
                      {m.role}
                    </span>
                  </div>
                  <button onClick={()=>toggleStatus(m)}
                    className={`rounded-full px-2.5 py-1 text-xs font-bold border transition ${
                      m.status==='Active'
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                    }`}>{m.status}</button>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  {m.phone && <p>📞 {m.phone}</p>}
                  {m.email && <p className="truncate">✉️ {m.email}</p>}
                  <p className="text-gray-400">Added {new Date(m.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</p>
                </div>

                <div className="flex gap-2 pt-1 border-t border-gray-100">
                  <button onClick={()=>openEdit(m)} className="flex-1 dp-btn dp-btn-outline text-xs py-1.5">✏️ Edit</button>
                  <button onClick={()=>deleteMember(m._id)} className="flex-1 dp-btn dp-btn-danger text-xs py-1.5">🗑 Delete</button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <Modal open onClose={()=>setShowForm(false)}>
            <div className="p-6">
              <h3 className="text-lg font-extrabold text-gray-900 mb-5">{editMember?'Edit Member':'Add Team Member'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Full Name" value={form.name} onChange={f('name')} required placeholder="e.g. Ali Hassan" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Phone" value={form.phone} onChange={f('phone')} placeholder="03xx-xxxxxxx" />
                  <Field label="Email" value={form.email} onChange={f('email')} type="email" placeholder="Login email" required={!editMember} />
                </div>
                {!editMember && <Field label="Password" value={form.password} onChange={f('password')} type="password" required placeholder="Min 6 characters" />}
                {editMember  && <Field label="New Password (blank = keep current)" value={form.password} onChange={f('password')} type="password" placeholder="Leave blank to keep" />}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="dp-label-text">Role <span className="text-red-500">*</span></label>
                    <select value={form.role} onChange={f('role')} required className="dp-input bg-white">
                      {ROLES.map(r=><option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="dp-label-text">Status</label>
                    <select value={form.status} onChange={f('status')} className="dp-input bg-white">
                      {STATUSES.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={()=>setShowForm(false)} className="dp-btn dp-btn-outline">Cancel</button>
                  <button type="submit" disabled={saving} className="dp-btn dp-btn-primary">
                    {saving?'Saving…':editMember?'Update':'Add Member'}
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
