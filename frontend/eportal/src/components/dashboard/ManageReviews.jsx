import { useState, useEffect } from 'react'
import api from '../../utils/api'

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
const STARS = n => '⭐'.repeat(n)

export default function ManageReviews() {
  const [reviews, setReviews] = useState([])
  const [filter, setFilter]   = useState('all') // all | pending | approved
  const [msg, setMsg]         = useState(null)

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews/all')
      setReviews(Array.isArray(res.data) ? res.data : [])
    } catch { setMsg({ type:'error', text:'Failed to load reviews' }) }
  }

  useEffect(() => { fetchReviews() }, [])

  const approve = async (id) => {
    try {
      await api.patch(`/reviews/${id}`, { isApproved: true })
      setMsg({ type:'success', text:'Review approved — now visible on landing page.' })
      fetchReviews()
    } catch { setMsg({ type:'error', text:'Failed' }) }
  }

  const reject = async (id) => {
    try {
      await api.patch(`/reviews/${id}`, { isApproved: false })
      setMsg({ type:'success', text:'Review hidden.' })
      fetchReviews()
    } catch { setMsg({ type:'error', text:'Failed' }) }
  }

  const remove = async (id) => {
    if (!confirm('Delete this review permanently?')) return
    try {
      await api.delete(`/reviews/${id}`)
      setMsg({ type:'success', text:'Review deleted.' })
      fetchReviews()
    } catch { setMsg({ type:'error', text:'Failed' }) }
  }

  const displayed = reviews.filter(r =>
    filter === 'all' ? true : filter === 'approved' ? r.isApproved : !r.isApproved
  )

  return (
    <div className="space-y-5">
      {msg && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${msg.type==='success'?'bg-primary-pale text-primary':'bg-rose-50 text-rose-700'}`}>
          {msg.text}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {['all','pending','approved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition ${filter===f?'text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            style={filter===f?{background:'linear-gradient(135deg,#0077b6,#04065c)'}:{}}>
            {f === 'pending' ? 'Pending Approval' : f.charAt(0).toUpperCase()+f.slice(1)} ({
              f==='all' ? reviews.length : f==='approved' ? reviews.filter(r=>r.isApproved).length : reviews.filter(r=>!r.isApproved).length
            })
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-primary-pale py-12 text-center">
          <p className="text-3xl">⭐</p>
          <p className="mt-2 text-gray-500">No reviews in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(r => (
            <div key={r._id} className="flex flex-col gap-3 rounded-2xl border border-primary-pale bg-white p-4 shadow-sm sm:flex-row sm:gap-4">
              {/* Avatar */}
              <div className="shrink-0">
                {r.studentImage ? (
                  <img src={`${BASE}/uploads/${r.studentImage}`} alt={r.studentName}
                    className="h-14 w-14 rounded-2xl object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-extrabold text-white"
                    style={{ background:'linear-gradient(135deg,#04065c,#0077b6)' }}>
                    {r.studentName?.[0] || '?'}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-gray-900">{r.studentName}</p>
                  <span className="rounded-full bg-primary-pale px-2 py-0.5 text-[10px] font-bold text-primary">{r.courseType}</span>
                  {r.courseName && <span className="text-xs text-gray-400">{r.courseName}</span>}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.isApproved?'bg-primary-pale text-primary':'bg-amber-100 text-amber-700'}`}>
                    {r.isApproved ? '✅ Approved' : '⏳ Pending'}
                  </span>
                </div>
                <p className="mt-1 text-xs">{STARS(r.rating)}</p>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">"{r.description}"</p>
                <p className="mt-1 text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-wrap gap-2 self-start">
                {!r.isApproved ? (
                  <button onClick={() => approve(r._id)}
                    className="rounded-lg bg-primary-pale px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-pale">
                    ✅ Approve
                  </button>
                ) : (
                  <button onClick={() => reject(r._id)}
                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200">
                    👁️ Hide
                  </button>
                )}
                <button onClick={() => remove(r._id)}
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
