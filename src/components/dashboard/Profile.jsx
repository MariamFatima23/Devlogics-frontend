import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

// Helper: build file URL — Cloudinary URLs start with https://, local filenames don't
const fileUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path  // already a full URL
  return `${BASE}/uploads/${path}`                   // local dev fallback
}
const QUALIFICATIONS = ['Matric', 'Intermediate', 'Bachelor', 'Master', 'PhD', 'Other']

const inp = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-blue-200'
const lbl = 'mb-1 block text-[11px] font-bold uppercase tracking-wider text-white/60'
const sel = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 pr-8 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-blue-200 appearance-none'

function Divider({ title }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="h-px flex-1 bg-white/15" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 whitespace-nowrap"
        style={{ color: 'var(--theme-accent)' }}>{title}</span>
      <div className="h-px flex-1 bg-white/15" />
    </div>
  )
}

export default function Profile() {
  const { user, login: authLogin } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [saving,     setSaving]     = useState(false)
  const [imgFile,    setImgFile]    = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const [cvFile,     setCvFile]     = useState(null)

  const [form, setForm] = useState({
    name: '', phone: '', cnic: '', gender: '',
    dob: '', country: '', city: '', qualification: '',
  })

  useEffect(() => {
    if (!user) return
    setForm({
      name:          user.name          || '',
      phone:         user.phone         || '',
      cnic:          user.cnic          || '',
      gender:        user.gender        || '',
      dob:           user.dob           || '',
      country:       user.country       || '',
      city:          user.city          || '',
      qualification: user.qualification || '',
    })
  }, [user])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleImg = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImgFile(file)
    setImgPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''))
      if (imgFile) fd.append('profileImage', imgFile)
      if (cvFile)  fd.append('cv', cvFile)
      const res = await api.patch('/users/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      authLogin(res.data.user, res.data.token)
      toast.success('Profile saved!')
      setImgFile(null); setCvFile(null)
      if (imgPreview) { URL.revokeObjectURL(imgPreview); setImgPreview(null) }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  const avatar   = imgPreview || fileUrl(user?.profileImage)
  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--theme-grad-sidebar)' }}
      >
        {/* Header banner */}
        <div className="relative flex flex-col items-center pt-8 pb-6 px-6"
          style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0.25) 0%,transparent 100%)' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, var(--theme-accent), transparent 70%)' }}/>

          <label className="relative cursor-pointer group z-10">
            {avatar ? (
              <img src={avatar} alt=""
                className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white/30 shadow-2xl transition group-hover:opacity-80"/>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl text-3xl font-extrabold text-white ring-4 ring-white/30 shadow-2xl transition group-hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.12)' }}>
                {initials}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition"
              style={{ background: 'rgba(0,0,0,0.5)' }}>
              <span className="text-white text-xs font-bold">📷 Change</span>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleImg}/>
            {imgFile && <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-400 ring-2 ring-white"/>}
          </label>

          <div className="mt-3 text-center z-10">
            <h2 className="text-lg font-extrabold text-white">{user.name}</h2>
            <p className="text-xs text-white/50">{user.email}</p>
            <span className="mt-1.5 inline-block rounded-full px-3 py-0.5 text-xs font-bold text-white"
              style={{
                background: isAdmin ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
              {isAdmin ? '🛡️ Admin' : '🎓 Student'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="px-6 pb-6 space-y-5">
          <Divider title="Basic Information" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={lbl}>Full Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required className={inp} placeholder="Your full name"/>
            </div>
            <div>
              <label className={lbl}>Email</label>
              <input value={user.email} disabled className={`${inp} cursor-not-allowed opacity-50`}/>
            </div>
            <div>
              <label className={lbl}>Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className={inp} placeholder="03XX-XXXXXXX" type="tel"/>
            </div>
            <div>
              <label className={lbl}>CNIC</label>
              <input value={form.cnic} onChange={e => set('cnic', e.target.value)} className={inp} placeholder="XXXXX-XXXXXXX-X"/>
            </div>
          </div>

          <Divider title="Personal Details" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={lbl}>Gender</label>
              <div className="relative">
                <select value={form.gender} onChange={e => set('gender', e.target.value)} className={sel}>
                  <option value="">Select gender</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
              </div>
            </div>
            <div>
              <label className={lbl}>Date of Birth</label>
              <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} className={`${inp} [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}/>
            </div>
            <div>
              <label className={lbl}>Country</label>
              <input value={form.country} onChange={e => set('country', e.target.value)} className={inp} placeholder="e.g. Pakistan"/>
            </div>
            <div>
              <label className={lbl}>City</label>
              <input value={form.city} onChange={e => set('city', e.target.value)} className={inp} placeholder="e.g. Lahore"/>
            </div>
          </div>

          {!isAdmin && (
            <>
              <Divider title="Professional Info" />
              <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={lbl}>Highest Qualification</label>
                <div className="relative">
                  <select value={form.qualification} onChange={e => set('qualification', e.target.value)} className={sel}>
                    <option value="">Select qualification</option>
                    {QUALIFICATIONS.map(q => <option key={q}>{q}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
                </div>
              </div>
              </div>

              <div>
                <label className={lbl}>CV (PDF / Word)</label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-4 transition hover:border-white/40 hover:bg-white/10">
                  <span className="text-2xl">📄</span>
                  <div className="flex-1 min-w-0">
                    {cvFile
                      ? <p className="text-sm font-semibold truncate" style={{ color: 'var(--theme-accent)' }}>✓ {cvFile.name}</p>
                      : user.cv
                      ? <p className="text-sm font-semibold text-green-300 truncate">Saved CV on file</p>
                      : <p className="text-sm text-white/50">Click to upload your CV</p>
                    }
                    <p className="text-xs text-white/30">PDF, DOC, DOCX · max 5MB</p>
                  </div>
                  {user.cv && !cvFile && (
                    <a href={fileUrl(user.cv)} target="_blank" rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="shrink-0 rounded-lg bg-white/10 px-3 py-1 text-xs font-bold hover:bg-white/20"
                      style={{ color: 'var(--theme-accent)' }}>
                      View
                    </a>
                  )}
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                    onChange={e => setCvFile(e.target.files?.[0] || null)}/>
                </label>
                {cvFile && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <p className="text-xs text-green-300 flex-1">Ready to save: {cvFile.name}</p>
                    <button type="button" onClick={() => setCvFile(null)} className="text-xs text-rose-400 hover:text-rose-300">Remove</button>
                  </div>
                )}
              </div>
            </>
          )}

          <motion.button type="submit" disabled={saving}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            className="w-full rounded-2xl py-3.5 text-sm font-extrabold text-white shadow-lg disabled:opacity-60 mt-2"
            style={{ background: 'var(--theme-grad-primary)' }}>
            {saving
              ? <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>Saving...
                </span>
              : '💾 Save Profile'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
