import { useState, useEffect } from 'react'
import api from '../../utils/api'

// Persian blue palette — admin doesn't need to pick colors
const BG_PRESETS = [
  { label:'Deep Blue',   bgFrom:'#03045e', bgTo:'#0077b6', accent:'#48cae4' },
  { label:'Ocean Blue',  bgFrom:'#023e8a', bgTo:'#0096c7', accent:'#90e0ef' },
  { label:'Sky Blue',    bgFrom:'#0077b6', bgTo:'#48cae4', accent:'#caf0f8' },
  { label:'Navy Cyan',   bgFrom:'#03045e', bgTo:'#0096c7', accent:'#48cae4' },
  { label:'Indigo Blue', bgFrom:'#023e8a', bgTo:'#0077b6', accent:'#ade8f4' },
]

const EMPTY = {
  title:'', subtitle:'', description:'', icon:'📚', tag:'',
  type:'course', mode:'online', duration:'3 Months', deadline:'',
  isPaid: false, price:0, paymentMethod:'', certified: false,
  stipend:'', level:'Beginner', seats:30, instructor:'DevLogics Team',
  bgFrom:'#03045e', bgTo:'#0077b6', accent:'#48cae4', features:'',
}

export default function ManageCourses() {
  const [courses, setCourses]   = useState([])
  const [form, setForm]         = useState(EMPTY)
  const [editId, setEditId]     = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg]           = useState(null)
  const [loading, setLoading]   = useState(false)

  const fetchCourses = async () => {
    try { setCourses((await api.get('/courses/all')).data) }
    catch { setMsg({ type:'error', text:'Failed to load courses' }) }
  }

  useEffect(() => { fetchCourses() }, [])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const applyPreset = (preset) => setForm(p => ({ ...p, bgFrom:preset.bgFrom, bgTo:preset.bgTo, accent:preset.accent }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        features: typeof form.features === 'string'
          ? form.features.split('\n').map(f => f.trim()).filter(Boolean)
          : form.features,
        price: Number(form.price),
        seats: Number(form.seats),
        isPaid: form.isPaid === true || form.isPaid === 'true',
        certified: form.certified === true || form.certified === 'true',
        deadline: form.deadline || undefined,
      }
      if (editId) {
        await api.patch(`/courses/${editId}`, payload)
        setMsg({ type:'success', text:'Course updated!' })
      } else {
        await api.post('/courses', payload)
        setMsg({ type:'success', text:'Course created! It is now visible on the home page.' })
      }
      setForm(EMPTY); setEditId(null); setShowForm(false)
      fetchCourses()
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Failed' })
    } finally { setLoading(false) }
  }

  const handleEdit = (course) => {
    setForm({
      ...course,
      features: Array.isArray(course.features) ? course.features.join('\n') : course.features || '',
      deadline: course.deadline ? course.deadline.slice(0,10) : '',
    })
    setEditId(course._id); setShowForm(true); setMsg(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return
    try { await api.delete(`/courses/${id}`); fetchCourses() }
    catch { setMsg({ type:'error', text:'Delete failed' }) }
  }

  const toggleActive = async (course) => {
    try { await api.patch(`/courses/${course._id}`, { isActive: !course.isActive }); fetchCourses() } catch {}
  }

  const inp = 'w-full rounded-xl border border-[#caf0f8] bg-[#f0f9ff] px-3 py-2.5 text-sm outline-none focus:border-[#0077b6] focus:bg-white'
  const lbl = 'mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500'
  const f   = form

  return (
    <div className="space-y-5">
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.type==='success'?'bg-emerald-50 text-emerald-700 border border-emerald-200':'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {msg.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{courses.length} course(s) · shown on home page</p>
        <button onClick={() => { setShowForm(!showForm); setForm(EMPTY); setEditId(null); setMsg(null) }}
          className="rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
          style={{ background:'linear-gradient(135deg,#0077b6,#03045e)' }}>
          {showForm ? '✕ Cancel' : '+ Add Course'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-[#caf0f8] bg-white p-6 shadow-sm">
          <h3 className="mb-1 font-extrabold text-gray-900">{editId ? 'Edit Course' : 'Add New Course'}</h3>
          <p className="mb-5 text-xs text-gray-400">This course will appear on the home page for students to apply.</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title + Subtitle */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={lbl}>Course Title *</label><input value={f.title} onChange={e=>set('title',e.target.value)} required className={inp} placeholder="e.g. Web Development" /></div>
              <div><label className={lbl}>Subtitle</label><input value={f.subtitle} onChange={e=>set('subtitle',e.target.value)} className={inp} placeholder="e.g. Full Stack with React & Node" /></div>
            </div>

            {/* Description */}
            <div><label className={lbl}>Description *</label><textarea value={f.description} onChange={e=>set('description',e.target.value)} required rows="3" className={inp} placeholder="What will students learn? What makes this course valuable?" /></div>

            {/* Type / Mode / Level */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={lbl}>Type *</label>
                <select value={f.type} onChange={e=>set('type',e.target.value)} className={inp}>
                  <option value="course">Course</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Mode *</label>
                <select value={f.mode} onChange={e=>set('mode',e.target.value)} className={inp}>
                  <option value="online">Online</option>
                  <option value="onsite">Onsite</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Level</label>
                <select value={f.level} onChange={e=>set('level',e.target.value)} className={inp}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
            </div>

            {/* Duration / Deadline / Seats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div><label className={lbl}>Duration</label><input value={f.duration} onChange={e=>set('duration',e.target.value)} className={inp} placeholder="3 Months" /></div>
              <div><label className={lbl}>Application Deadline</label><input type="date" value={f.deadline} onChange={e=>set('deadline',e.target.value)} className={inp} /></div>
              <div><label className={lbl}>Total Seats</label><input type="number" value={f.seats} onChange={e=>set('seats',e.target.value)} className={inp} /></div>
            </div>

            {/* Paid / Certified toggles */}
            <div className="flex flex-wrap gap-6 rounded-xl bg-[#f0f9ff] p-4">
              <button type="button" onClick={() => set('isPaid', !f.isPaid)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold border-2 transition ${f.isPaid?'border-[#0077b6] bg-[#0077b6] text-white':'border-[#caf0f8] text-gray-600'}`}>
                💳 {f.isPaid ? 'Paid Course ✓' : 'Free Course'}
              </button>
              <button type="button" onClick={() => set('certified', !f.certified)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold border-2 transition ${f.certified?'border-emerald-500 bg-emerald-500 text-white':'border-[#caf0f8] text-gray-600'}`}>
                🎓 {f.certified ? 'Certificate Provided ✓' : 'No Certificate'}
              </button>
            </div>

            {/* Paid fields */}
            {f.isPaid && (
              <div className="grid gap-4 rounded-xl border-2 border-amber-200 bg-amber-50 p-4 sm:grid-cols-2">
                <div><label className={lbl}>Price (PKR) *</label><input type="number" value={f.price} onChange={e=>set('price',e.target.value)} className={inp} placeholder="5000" /></div>
                <div><label className={lbl}>Payment Method</label><input value={f.paymentMethod} onChange={e=>set('paymentMethod',e.target.value)} className={inp} placeholder="JazzCash / Easypaisa / Bank Transfer" /></div>
              </div>
            )}

            {/* Stipend for internship */}
            {f.type === 'internship' && (
              <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                <label className={lbl}>Stipend</label>
                <input value={f.stipend} onChange={e=>set('stipend',e.target.value)} className={inp} placeholder="e.g. PKR 10,000/month or Unpaid" />
              </div>
            )}

            {/* Icon / Tag / Instructor */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div><label className={lbl}>Icon (emoji)</label><input value={f.icon} onChange={e=>set('icon',e.target.value)} className={inp} placeholder="💻" /></div>
              <div><label className={lbl}>Tag / Category</label><input value={f.tag} onChange={e=>set('tag',e.target.value)} className={inp} placeholder="e.g. Development, AI, Design" /></div>
              <div><label className={lbl}>Instructor Name</label><input value={f.instructor} onChange={e=>set('instructor',e.target.value)} className={inp} /></div>
            </div>

            {/* Card Color — one-click presets */}
            <div>
              <label className={lbl}>Card Color Theme</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {BG_PRESETS.map(preset => (
                  <button key={preset.label} type="button" onClick={() => applyPreset(preset)}
                    className={`rounded-xl px-3 py-2 text-xs font-bold text-white transition hover:scale-105 ${f.bgFrom===preset.bgFrom&&f.bgTo===preset.bgTo?'ring-2 ring-offset-2 ring-[#0077b6]':''}`}
                    style={{ background:`linear-gradient(135deg,${preset.bgFrom},${preset.bgTo})` }}>
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="mt-2 h-10 w-full rounded-xl" style={{ background:`linear-gradient(135deg,${f.bgFrom},${f.bgTo})` }} />
            </div>

            {/* Features */}
            <div>
              <label className={lbl}>What Students Will Learn (one per line)</label>
              <textarea value={f.features} onChange={e=>set('features',e.target.value)} rows="4" className={inp}
                placeholder={'HTML/CSS/JS\nReact.js\nNode.js\nLive Projects'} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60 transition hover:opacity-90"
              style={{ background:'linear-gradient(135deg,#0077b6,#03045e)' }}>
              {loading ? 'Saving...' : (editId ? '💾 Update Course' : '✅ Add Course to Portal')}
            </button>
          </form>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-[#caf0f8] py-16 text-center">
          <p className="text-4xl">📚</p>
          <p className="mt-3 font-bold text-gray-700">No courses yet</p>
          <p className="mt-1 text-sm text-gray-400">Add your first course — it will instantly appear on the home page.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map(course => (
            <div key={course._id} className="flex flex-col gap-3 rounded-2xl border border-[#caf0f8] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-sm"
                  style={{ background:`linear-gradient(135deg,${course.bgFrom||'#03045e'},${course.bgTo||'#0077b6'})` }}>
                  {course.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-gray-900">{course.title}</p>
                    <span className="rounded-full bg-[#e0f7fa] px-2 py-0.5 text-[10px] font-bold text-[#03045e] capitalize">{course.type}</span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 capitalize">{course.mode}</span>
                    {course.isPaid && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">💳 PKR {course.price?.toLocaleString()}</span>}
                    {course.certified && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">🎓 Certified</span>}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${course.isActive?'bg-emerald-100 text-emerald-700':'bg-gray-100 text-gray-500'}`}>
                      {course.isActive ? '● Live' : '○ Hidden'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{course.description}</p>
                  <p className="mt-0.5 text-[10px] text-gray-400">
                    {course.duration} · {course.level} · {course.seats} seats · {course.instructor}
                    {course.deadline && ` · Deadline: ${new Date(course.deadline).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button onClick={() => toggleActive(course)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${course.isActive?'bg-gray-100 text-gray-600 hover:bg-gray-200':'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                  {course.isActive ? 'Hide' : 'Show'}
                </button>
                <button onClick={() => handleEdit(course)}
                  className="rounded-lg bg-[#e0f7fa] px-3 py-1.5 text-xs font-semibold text-[#0077b6] hover:bg-[#caf0f8]">
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(course._id)}
                  className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100">
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
