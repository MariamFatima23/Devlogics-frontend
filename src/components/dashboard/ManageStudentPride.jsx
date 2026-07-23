import { useState, useEffect } from 'react'
import api, { fileUrl } from '../../utils/api'

const EMPTY = {
  name: '', role: '', courseType: 'Course', courseName: '',
  badge: '', quote: '', color: 'from-blue-600 to-blue-900', order: 0,
}

const COLORS = [
  { label: 'Blue', value: 'from-blue-600 to-blue-900' },
  { label: 'Cyan-Blue', value: 'from-cyan-500 to-blue-700' },
  { label: 'Indigo', value: 'from-indigo-500 to-blue-700' },
  { label: 'Blue-Cyan', value: 'from-blue-500 to-cyan-700' },
  { label: 'Sky', value: 'from-blue-400 to-cyan-600' },
  { label: 'Deep Blue', value: 'from-indigo-600 to-blue-900' },
]

export default function ManageStudentPride() {
  const [students, setStudents] = useState([])
  const [form, setForm]         = useState(EMPTY)
  const [image, setImage]       = useState(null)
  const [editId, setEditId]     = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg]           = useState(null)
  const [loading, setLoading]   = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  const fetchStudents = async () => {
    try {
      const res = await api.get('/student-pride/all')
      setStudents(Array.isArray(res.data) ? res.data : [])
    } catch { setMsg({ type:'error', text:'Failed to load students' }) }
    finally { setFetchLoading(false) }
  }

  useEffect(() => { fetchStudents() }, [])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => data.append(k, v))
      if (image) data.append('image', image)

      if (editId) {
        await api.patch(`/student-pride/${editId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
        setMsg({ type:'success', text:'Student updated!' })
      } else {
        await api.post('/student-pride', data, { headers: { 'Content-Type': 'multipart/form-data' } })
        setMsg({ type:'success', text:'Student added to Our Pride section!' })
      }
      setForm(EMPTY); setImage(null); setEditId(null); setShowForm(false)
      fetchStudents()
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Failed' })
    } finally { setLoading(false) }
  }

  const handleEdit = (s) => {
    setForm({ name:s.name, role:s.role||'', courseType:s.courseType||'Course', courseName:s.courseName||'', badge:s.badge||'', quote:s.quote, color:s.color||COLORS[0].value, order:s.order||0 })
    setEditId(s._id)
    setShowForm(true)
    setMsg(null)
    setImage(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this student?')) return
    try {
      await api.delete(`/student-pride/${id}`)
      setMsg({ type:'success', text:'Removed.' })
      fetchStudents()
    } catch { setMsg({ type:'error', text:'Failed' }) }
  }

  const toggleActive = async (s) => {
    try {
      const data = new FormData()
      data.append('isActive', String(!s.isActive))
      await api.patch(`/student-pride/${s._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      fetchStudents()
    } catch {}
  }

  const inputCls = 'w-full rounded-xl border border-primary-pale bg-primary-ice px-3 py-2.5 text-sm outline-none focus:border-primary-blue focus:bg-white transition'
  const labelCls = 'mb-1 block text-sm font-semibold text-gray-700'

  return (
    <div className="space-y-5">
      {msg && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${msg.type==='success'?'bg-primary-pale text-primary':'bg-rose-50 text-rose-700'}`}>
          {msg.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{fetchLoading ? '...' : `${students.length} student(s) in Our Pride`}</p>
        <button onClick={() => { setShowForm(!showForm); setForm(EMPTY); setImage(null); setEditId(null); setMsg(null) }}
          className="rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
          style={{ background:'linear-gradient(135deg,#0077b6,#04065c)' }}>
          {showForm ? 'Cancel' : '+ Add Student'}
        </button>
      </div>

      {fetchLoading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1,2,3,4].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-primary-pale bg-white p-6 shadow-sm">
          <h3 className="mb-5 font-bold text-gray-900">{editId ? 'Edit Student' : 'Add to Our Pride'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Photo */}
            <div>
              <label className={labelCls}>Student Photo</label>
              <label className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-primary-pale p-4 hover:border-primary-blue hover:bg-primary-ice transition">
                {image ? (
                  <img src={URL.createObjectURL(image)} alt="" className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-pale text-2xl">🧑</div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-700">{image ? image.name : 'Click to upload photo'}</p>
                  <p className="text-xs text-gray-400">PNG, JPG recommended</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => setImage(e.target.files[0])} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={labelCls}>Full Name *</label><input value={form.name} onChange={e=>set('name',e.target.value)} required className={inputCls} placeholder="Ahmed Raza" /></div>
              <div><label className={labelCls}>Role / Skill</label><input value={form.role} onChange={e=>set('role',e.target.value)} className={inputCls} placeholder="Web Developer" /></div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Type</label>
                <select value={form.courseType} onChange={e=>set('courseType',e.target.value)} className={inputCls}>
                  <option value="Course">Course</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div><label className={labelCls}>Course / Program Name</label><input value={form.courseName} onChange={e=>set('courseName',e.target.value)} className={inputCls} placeholder="Web Development" /></div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={labelCls}>Badge</label><input value={form.badge} onChange={e=>set('badge',e.target.value)} className={inputCls} placeholder="Top Student" /></div>
              <div>
                <label className={labelCls}>Card Color Theme</label>
                <select value={form.color} onChange={e=>set('color',e.target.value)} className={inputCls}>
                  {COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Quote / Experience *</label>
              <textarea value={form.quote} onChange={e=>{ if(e.target.value.length<=300) set('quote',e.target.value) }} required rows="3" className={inputCls} placeholder="Share their experience in 1-2 sentences..." />
              <p className="mt-1 text-right text-xs text-gray-400">{form.quote.length}/300</p>
            </div>

            <div>
              <label className={labelCls}>Display Order</label>
              <input type="number" value={form.order} onChange={e=>set('order',e.target.value)} className={inputCls} placeholder="0" />
            </div>

            <button type="submit" disabled={loading}
              className="rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60 transition hover:opacity-90"
              style={{ background:'linear-gradient(135deg,#0077b6,#04065c)' }}>
              {loading ? 'Saving...' : (editId ? '💾 Update Student' : '✅ Add to Our Pride')}
            </button>
          </form>
        </div>
      )}

      {students.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-primary-pale py-12 text-center">
          <p className="text-3xl">🌟</p>
          <p className="mt-2 text-gray-500">No students added yet. Feature your top students!</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {students.map(s => (
            <div key={s._id} className="flex items-start gap-3 rounded-2xl border border-primary-pale bg-white p-4 shadow-sm">
              {s.image ? (
                <img src={fileUrl(s.image)} alt={s.name}
                  className="h-12 w-12 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-base font-extrabold text-white`}>
                  {s.name?.[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-gray-900">{s.name}</p>
                  {s.badge && <span className="rounded-full bg-primary-pale px-2 py-0.5 text-[10px] font-bold text-primary">{s.badge}</span>}
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">{s.courseType}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.isActive?'bg-primary-pale text-primary':'bg-gray-100 text-gray-500'}`}>
                    {s.isActive ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{s.role}{s.courseName ? ` · ${s.courseName}` : ''}</p>
                <p className="mt-1 text-xs text-gray-500 line-clamp-1">"{s.quote}"</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <button onClick={() => toggleActive(s)}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${s.isActive?'bg-gray-100 text-gray-600 hover:bg-gray-200':'bg-primary-pale text-primary hover:bg-primary-pale'}`}>
                  {s.isActive ? 'Hide' : 'Show'}
                </button>
                <button onClick={() => handleEdit(s)}
                  className="rounded-lg bg-primary-pale px-2.5 py-1 text-[10px] font-bold text-primary-blue hover:bg-primary-pale">
                  Edit
                </button>
                <button onClick={() => handleDelete(s._id)}
                  className="rounded-lg bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-100">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
