import { useState, useEffect } from 'react'
import api from '../../utils/api'

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const STATUS_COLORS = {
  Pending:        'bg-amber-100 text-amber-700',
  'Under Review': 'bg-blue-100 text-blue-700',
  Approved:       'bg-green-100 text-green-700',
  Rejected:       'bg-rose-100 text-rose-700',
}

const STATUS_TABS = ['Pending', 'Under Review', 'Approved', 'Rejected']

function ActionModal({ app, action, onClose, onConfirm }) {
  const [comment, setComment] = useState('')
  const isReject = action === 'Rejected'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="mb-1 text-lg font-bold text-slate-900">
          {action === 'Under Review' ? '🔍 Mark Under Review' : action === 'Approved' ? '✅ Approve Application' : '❌ Reject Application'}
        </h3>
        <p className="mb-4 text-sm text-slate-500">
          Application: <span className="font-semibold">{app.title}</span>
        </p>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            {isReject ? 'Rejection Reason *' : 'Comment (optional)'}
          </label>
          <textarea
            rows="3"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={isReject ? 'Explain why this application is rejected...' : 'Add a note for the student...'}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              if (isReject && !comment.trim()) return alert('Please enter rejection reason')
              onConfirm(app._id, action, comment)
            }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold text-white transition ${
              isReject ? 'bg-rose-600 hover:bg-rose-700' : action === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}>
            Confirm {action}
          </button>
          <button onClick={onClose}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function ReviewApplications() {
  const [apps, setApps]     = useState([])
  const [filter, setFilter] = useState('Pending')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg]       = useState(null)
  const [modal, setModal]   = useState(null)
  const [counts, setCounts] = useState({})

  const fetchApps = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/applications?status=${filter}`)
      setApps(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCounts = async () => {
    try {
      const res = await api.get('/applications/stats')
      setCounts({
        Pending:        res.data.pending,
        'Under Review': res.data.underReview,
        Approved:       res.data.approved,
        Rejected:       res.data.rejected,
      })
    } catch {}
  }

  useEffect(() => { fetchApps(); fetchCounts() }, [filter])

  const handleConfirm = async (id, status, comment) => {
    try {
      await api.patch(`/applications/${id}/status`, {
        status,
        adminComment:    status !== 'Rejected' ? comment : '',
        rejectionReason: status === 'Rejected'  ? comment : '',
      })
      setMsg({ type: 'success', text: `Application marked as ${status}. Student has been notified. ✅` })
      setModal(null)
      setApps(prev => prev.filter(a => a._id !== id))
      fetchCounts()
      setTimeout(() => setMsg(null), 4000)
    } catch {
      setMsg({ type: 'error', text: 'Failed to update status. Please try again.' })
    }
  }

  const fileUrl = (path) => (path && (path.startsWith('http://') || path.startsWith('https://'))) ? path : (path ? `${BASE}/uploads/${path}` : null)

  return (
    <div>
      {modal && <ActionModal app={modal.app} action={modal.action} onClose={() => setModal(null)} onConfirm={handleConfirm} />}

      {msg && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
              filter === s ? 'text-white shadow-md' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
            style={filter === s ? { background: 'linear-gradient(135deg,#0077b6,#04065c)' } : {}}>
            {s}
            {counts[s] !== undefined && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${filter === s ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {counts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      ) : apps.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <p className="text-4xl">📋</p>
          <p className="mt-3 text-lg font-bold text-slate-600">No {filter} Applications</p>
          <p className="mt-1 text-sm text-slate-400">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map(a => (
            <div key={a._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition sm:p-5">
              {/* Header */}
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">{a.type}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                  </div>
                  <h3 className="font-bold text-slate-900">{a.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">{a.description}</p>
                </div>
              </div>

              {/* Student Info */}
              <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span>👤 <strong>{a.studentName}</strong></span>
                  <span>📧 {a.studentEmail}</span>
                  {a.rollNumber  && <span>🎓 {a.rollNumber}</span>}
                  {a.department  && <span>🏫 {a.department}</span>}
                  {a.batchester  && <span>📅 {a.batchester} batch</span>}
                  <span>🕒 {new Date(a.createdAt).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' })}</span>
                </div>
              </div>

              {/* Attachments */}
              {a.attachments?.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {a.attachments.map((f, i) => (
                    <a key={i} href={fileUrl(f.filePath || f.fileName)} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition">
                      📎 {f.originalName}
                      <span className="text-slate-400">({(f.fileSize / 1024).toFixed(0)}KB)</span>
                    </a>
                  ))}
                </div>
              )}

              {/* Actions */}
              {a.status === 'Pending' && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setModal({ app: a, action: 'Under Review' })}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition">
                    🔍 Mark Under Review
                  </button>
                  <button onClick={() => setModal({ app: a, action: 'Approved' })}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 transition">
                    ✅ Approve
                  </button>
                  <button onClick={() => setModal({ app: a, action: 'Rejected' })}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 transition">
                    ❌ Reject
                  </button>
                </div>
              )}

              {a.status === 'Under Review' && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setModal({ app: a, action: 'Approved' })}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 transition">
                    ✅ Approve
                  </button>
                  <button onClick={() => setModal({ app: a, action: 'Rejected' })}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 transition">
                    ❌ Reject
                  </button>
                </div>
              )}

              {(a.adminComment || a.rejectionReason) && (
                <div className={`mt-3 rounded-lg p-3 text-sm ${a.status === 'Rejected' ? 'bg-rose-50 text-rose-800' : 'bg-green-50 text-green-800'}`}>
                  <strong>Admin Note:</strong> {a.adminComment || a.rejectionReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReviewApplications
