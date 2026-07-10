import { useState } from 'react'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

export default function AddReview() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    courseType: 'Course', courseName: '', description: '', rating: 5,
  })
  const [image, setImage]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => data.append(k, v))
      if (image) data.append('studentImage', image)
      await api.post('/reviews', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setMsg({ type: 'success', text: 'Review submitted! Admin will approve it shortly.' })
      setForm({ courseType: 'Course', courseName: '', description: '', rating: 5 })
      setImage(null)
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit review.' })
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-[#caf0f8] bg-[#f0f9ff] px-3 py-2.5 text-sm outline-none focus:border-[#0077b6] focus:bg-white transition'
  const labelCls = 'mb-1 block text-sm font-semibold text-gray-700'

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="rounded-2xl border border-[#caf0f8] bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-lg font-extrabold text-gray-900">Share Your Experience</h3>
        <p className="mb-5 text-sm text-gray-400">Your review will appear after admin approval.</p>

        {msg && (
          <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${msg.type==='success'?'bg-emerald-50 text-emerald-700':'bg-rose-50 text-rose-700'}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo upload */}
          <div>
            <label className={labelCls}>Your Photo</label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-[#caf0f8] p-4 transition hover:border-[#0077b6] hover:bg-[#f0f9ff]">
              {image ? (
                <img src={URL.createObjectURL(image)} alt="preview" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#caf0f8] text-xl">👤</div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-700">{image ? image.name : 'Upload your photo'}</p>
                <p className="text-xs text-gray-400">PNG, JPG · optional but recommended</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={e => setImage(e.target.files[0])} />
            </label>
          </div>

          {/* Course type */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Type *</label>
              <select value={form.courseType} onChange={e=>set('courseType',e.target.value)} className={inputCls}>
                <option value="Course">Course</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Course / Program Name</label>
              <input value={form.courseName} onChange={e=>set('courseName',e.target.value)} className={inputCls} placeholder="e.g. Web Development" />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className={labelCls}>Rating *</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => set('rating', n)}
                  className={`text-2xl transition hover:scale-110 ${n<=form.rating?'opacity-100':'opacity-30'}`}>
                  ⭐
                </button>
              ))}
              <span className="ml-2 self-center text-sm font-bold text-gray-600">{form.rating}/5</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Your Review * <span className="font-normal text-gray-400">(max 500 characters)</span></label>
            <textarea
              value={form.description}
              onChange={e => { if (e.target.value.length <= 500) set('description', e.target.value) }}
              required rows="4" className={inputCls}
              placeholder="Share what you learned, how it helped you..." />
            <p className="mt-1 text-right text-xs text-gray-400">{form.description.length}/500</p>
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60 transition hover:opacity-90"
            style={{ background:'linear-gradient(135deg,#0077b6,#03045e)' }}>
            {loading ? 'Submitting...' : '✉️ Submit Review'}
          </button>
        </form>
      </div>
    </div>
  )
}
