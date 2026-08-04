import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const ROLES    = ['Sales', 'Marketing', 'Counselor', 'Manager', 'Support', 'Other']
const STATUSES = ['Active', 'Inactive']

const ROLE_COLORS = {
  Sales:     { bg: 'rgba(52,211,153,0.15)',  text: '#34d399' },
  Marketing: { bg: 'rgba(251,191,36,0.15)',  text: '#fbbf24' },
  Counselor: { bg: 'rgba(147,197,253,0.15)', text: '#93c5fd' },
  Manager:   { bg: 'rgba(167,139,250,0.15)', text: '#a78bfa' },
  Support:   { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
  Other:     { bg: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.5)' },
}

const ROLE_ICONS = { Sales:'💰', Marketing:'📣', Counselor:'🎓', Manager:'👑', Support:'🛠️', Other:'👤' }

const EMPTY = { name:'', email:'', phone:'', role:'Sales', status:'Active', password:'' }

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ scale:0.93, opacity:0 }} animate={{ scale:1, opacity:1 }}
        exit={{ scale:0.93, opacity:0 }} transition={{ type:'spring', stiffness:340, damping:28 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 shadow-2xl"
        style={{ background:'linear-gradient(135deg,#04065c,#023e8a)' }}
        onClick={e => e.stopPropagation()}
      >{children}</motion.div>
    </div>
  )
}

function Field({ label, value, onChange, type='text', required=false, placeholder='' }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input type={type} value={value} onChange={onChange} required={required} placeholder={placeholder}
        className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/60 focus:bg-white/15 transition" />
    </div>
  )
}

export default function CrmTeam() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editMember, setEditMember] = useState(null)
  const [form, setForm]   = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterRole, setFilterRole] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/team-members')
      setMembers(data)
    } catch { toast.error('Failed to load team') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setForm(EMPTY); setEditMember(null); setShowForm(true) }
  const openEdit = (m) => {
    setForm({ name:m.name, email:m.email||'', phone:m.phone||'', role:m.role, status:m.status })
    setEditMember(m); setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editMember) { await api.put(`/team-members/${editMember._id}`, form); toast.success('Updated') }
      else            { await api.post('/team-members', form); toast.success('Team member added') }
      setShowForm(false); load()
    } catch (e) { toast.error(e.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const deleteMember = async (id) => {
    if (!window.confirm('Delete this team member?')) return
    try { await api.delete(`/team-members/${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Error') }
  }

  const toggleStatus = async (m) => {
    const newStatus = m.status === 'Active' ? 'Inactive' : 'Active'
    try { await api.put(`/team-members/${m._id}`, { status: newStatus }); load() }
    catch { toast.error('Error') }
  }

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const filtered = filterRole ? members.filter(m => m.role === filterRole) : members

  // Role summary
  const roleSummary = ROLES.map(r => ({ role: r, count: members.filter(m => m.role === r && m.status === 'Active').length }))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white">CRM Team</h2>
          <p className="text-sm text-white/40">Manage your sales & marketing team</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14"/></svg>
          Add Member
        </button>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {roleSummary.map(({ role, count }) => {
          const rc = ROLE_COLORS[role]
          return (
            <button key={role} onClick={() => setFilterRole(filterRole === role ? '' : role)}
              className={`rounded-xl border px-2 py-3 text-center transition ${filterRole === role ? 'border-cyan-400/40 ring-1 ring-cyan-400/30' : 'border-white/10'}`}
              style={{ background: filterRole === role ? rc.bg : 'rgba(255,255,255,0.04)' }}>
              <p className="text-xl mb-0.5">{ROLE_ICONS[role]}</p>
              <p className="text-base font-extrabold" style={{ color: rc.text }}>{count}</p>
              <p className="text-[10px] text-white/40 leading-tight">{role}</p>
            </button>
          )
        })}
      </div>

      {/* Filter bar */}
      {filterRole && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/50">Showing: <strong className="text-white">{filterRole}</strong></span>
          <button onClick={() => setFilterRole('')} className="text-xs text-cyan-400 hover:text-cyan-300 transition">Clear ✕</button>
        </div>
      )}

      {/* Team Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-white/40 text-sm">No team members yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(m => {
            const rc = ROLE_COLORS[m.role] || ROLE_COLORS.Other
            const isActive = m.status === 'Active'
            return (
              <motion.div key={m._id} layout
                className="rounded-2xl border border-white/10 p-4 flex flex-col gap-3"
                style={{ background:'linear-gradient(135deg,rgba(4,6,92,0.8),rgba(2,62,138,0.4))' }}>
                {/* Top row */}
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl border"
                    style={{ background: rc.bg, borderColor: rc.bg.replace('0.15','0.3') }}>
                    {ROLE_ICONS[m.role] || '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">{m.name}</h3>
                    <span className="inline-block mt-0.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ background: rc.bg, color: rc.text }}>
                      {m.role}
                    </span>
                  </div>
                  {/* Status toggle */}
                  <button onClick={() => toggleStatus(m)}
                    className={`rounded-full px-2.5 py-1 text-xs font-bold border transition ${
                      isActive
                        ? 'border-green-400/30 bg-green-400/10 text-green-400 hover:bg-green-400/20'
                        : 'border-red-400/30 bg-red-400/10 text-red-400 hover:bg-red-400/20'
                    }`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {/* Contact info */}
                <div className="space-y-1 text-xs text-white/50">
                  {m.phone && <p>📞 {m.phone}</p>}
                  {m.email && <p className="truncate">✉️ {m.email}</p>}
                  <p className="text-white/30">Added {new Date(m.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1 border-t border-white/10">
                  <button onClick={() => openEdit(m)}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs text-white/60 hover:bg-white/15 transition">
                    ✏️ Edit
                  </button>
                  <button onClick={() => deleteMember(m._id)}
                    className="flex-1 rounded-lg border border-red-400/20 bg-red-400/10 py-1.5 text-xs text-red-400 hover:bg-red-400/20 transition">
                    🗑 Delete
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <Modal open onClose={() => setShowForm(false)}>
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-5">{editMember ? 'Edit Member' : 'Add Team Member'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Full Name" value={form.name} onChange={f('name')} required placeholder="e.g. Ali Hassan" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Phone" value={form.phone} onChange={f('phone')} placeholder="03xx-xxxxxxx" />
                  <Field label="Email" value={form.email} onChange={f('email')} type="email" placeholder="Login email" required={!editMember} />
                </div>
                {!editMember && (
                  <Field label="Password" value={form.password} onChange={f('password')} type="password" required placeholder="Min 6 characters" />
                )}
                {editMember && (
                  <Field label="New Password (leave blank to keep)" value={form.password} onChange={f('password')} type="password" placeholder="Leave blank to keep current" />
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Role <span className="text-red-400">*</span></label>
                    <select value={form.role} onChange={f('role')} required
                      className="rounded-xl border border-white/10 bg-[#04065c] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 transition">
                      {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Status</label>
                    <select value={form.status} onChange={f('status')}
                      className="rounded-xl border border-white/10 bg-[#04065c] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 transition">
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/60 hover:bg-white/10 transition">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-cyan-400 disabled:opacity-50 transition">
                    {saving ? 'Saving…' : editMember ? 'Update' : 'Add Member'}
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
