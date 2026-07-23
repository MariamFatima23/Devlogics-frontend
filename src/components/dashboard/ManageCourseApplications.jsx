import { useState, useEffect } from 'react'
import api, { fileUrl } from '../../utils/api'

const STATUS_COLORS = {
  Pending:      'bg-amber-100 text-amber-700',
  'Under Review': 'bg-blue-100 text-blue-700',
  Approved:     'bg-primary-pale text-primary',
  Rejected:     'bg-rose-100 text-rose-700',
}

export default function ManageCourseApplications() {
  const [apps, setApps]         = useState([])
  const [filter, setFilter]     = useState('all')
  const [selected, setSelected] = useState(null) // detail view
  const [comment, setComment]   = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState(null)
  const [stats, setStats]       = useState({})

  const fetchApps = async () => {
    try {
      const query = filter !== 'all' ? `?status=${encodeURIComponent(filter)}` : ''
      const res = await api.get(`/course-applications/all${query}`)
      setApps(Array.isArray(res.data) ? res.data : [])
    } catch { setMsg({ type:'error', text:'Failed to load applications' }) }
  }

  const fetchStats = async () => {
    try {
      const res = await api.get('/course-applications/stats')
      setStats(res.data && typeof res.data === 'object' ? res.data : {})
    } catch {}
  }

  useEffect(() => { fetchApps(); fetchStats() }, [filter])

  const updateStatus = async (id) => {
    if (!newStatus) return
    setLoading(true)
    try {
      await api.patch(`/course-applications/${id}/status`, { status: newStatus, adminComment: comment })
      setMsg({ type:'success', text:`Application marked as ${newStatus}` })
      setSelected(null); setComment(''); setNewStatus('')
      fetchApps(); fetchStats()
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Update failed' })
    } finally { setLoading(false) }
  }

  const FILTERS = ['all', 'Pending', 'Under Review', 'Approved', 'Rejected']

  return (
    <div className="space-y-5">
      {msg && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${msg.type==='success'?'bg-primary-pale text-primary':'bg-rose-50 text-rose-700'}`}>
          {msg.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label:'Total',        value: stats.total || 0,       color:'#04065c' },
          { label:'Pending',      value: stats.pending || 0,     color:'#d97706' },
          { label:'Under Review', value: stats.underReview || 0, color:'#1d4ed8' },
          { label:'Approved',     value: stats.approved || 0,    color:'#059669' },
          { label:'Rejected',     value: stats.rejected || 0,    color:'#dc2626' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-primary-pale bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition ${filter===f?'text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            style={filter===f?{background:'linear-gradient(135deg,#0077b6,#04065c)'}:{}}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(3,4,94,0.7)', backdropFilter:'blur(4px)' }}
          onClick={e => { if(e.target===e.currentTarget){setSelected(null);setComment('');setNewStatus('')} }}>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <button onClick={() => { setSelected(null); setComment(''); setNewStatus('') }}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">✕</button>

            <h3 className="mb-4 text-lg font-extrabold text-gray-900">Application Detail</h3>

            <div className="mb-4 grid gap-3 rounded-2xl bg-primary-ice p-4 text-sm sm:grid-cols-2">
              {[
                ['Student', selected.studentName],
                ['Email', selected.studentEmail],
                ['Course', selected.courseName],
                ['Type', selected.courseType],
                ['Phone', selected.phone],
                ['CNIC', selected.cnic || '—'],
                ['Qualification', selected.qualification],
                ['Experience', selected.experience || 'None'],
                ['LinkedIn', selected.linkedIn || '—'],
                ['Portfolio', selected.portfolio || '—'],
                ['Payment Method', selected.paymentMethod || '—'],
                ['Transaction ID', selected.transactionId || '—'],
                ['Status', selected.status],
                ['Applied On', new Date(selected.createdAt).toLocaleDateString()],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                  <p className="font-medium text-gray-800">{val}</p>
                </div>
              ))}
            </div>

            {/* Why Apply */}
            <div className="mb-4 rounded-xl border border-primary-pale p-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">Why Apply</p>
              <p className="text-sm text-gray-700">{selected.whyApply}</p>
            </div>

            {/* File links */}
            <div className="mb-4 flex flex-wrap gap-3">
              {selected.cvFile && (
                <a href={fileUrl(selected.cvFile)} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-primary-pale px-4 py-2 text-sm font-semibold text-primary-blue hover:bg-primary-pale">
                  📄 Download CV ({selected.cvOriginalName || 'cv'})
                </a>
              )}
              {selected.paymentProof && (
                <a href={fileUrl(selected.paymentProof)} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-200">
                  🧾 View Payment Proof
                </a>
              )}
            </div>

            {/* Internship signature */}
            {selected.agreementSigned && selected.signatureFile && (
              <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-600">✅ Agreement Signed — Student Signature</p>
                <img
                  src={fileUrl(selected.signatureFile)}
                  alt="Student Signature"
                  className="max-h-28 rounded-xl border border-blue-200 bg-white p-2"
                  style={{ maxWidth: '100%' }}
                />
              </div>
            )}
            {selected.courseType === 'internship' && !selected.agreementSigned && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700 font-medium">
                ⚠️ Agreement not yet signed by student.
              </div>
            )}            {/* Admin comment */}
            <div className="mb-3">
              <label className="mb-1 block text-sm font-bold text-gray-700">Admin Comment (optional)</label>
              <textarea value={comment} onChange={e=>setComment(e.target.value)} rows="2"
                className="w-full rounded-xl border border-primary-pale bg-primary-ice px-3 py-2.5 text-sm outline-none focus:border-primary-blue"
                placeholder="Reason for approval or rejection..." />
            </div>

            {/* Status actions */}
            <div className="flex flex-wrap gap-2">
              {['Under Review','Approved','Rejected'].map(s => (
                <button key={s} onClick={() => setNewStatus(s)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition border-2 ${newStatus===s?'text-white border-transparent':'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                  style={newStatus===s?{background:'linear-gradient(135deg,#0077b6,#04065c)'}:{}}>
                  {s}
                </button>
              ))}
              <button onClick={() => updateStatus(selected._id)} disabled={!newStatus || loading}
                className="ml-auto rounded-xl px-5 py-2 text-xs font-bold text-white disabled:opacity-50"
                style={{ background:'linear-gradient(135deg,#059669,#04065c)' }}>
                {loading ? 'Saving...' : '✅ Update Status'}
              </button>
            </div>

            {/* Timeline */}
            {selected.timeline?.length > 0 && (
              <div className="mt-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Timeline</p>
                <div className="space-y-2">
                  {selected.timeline.map((t, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary-blue" />
                      <div>
                        <span className="font-bold text-gray-800">{t.status}</span>
                        {t.comment && <span className="text-gray-500"> — {t.comment}</span>}
                        <span className="ml-2 text-gray-400">by {t.updatedBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Applications list */}
      {apps.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-primary-pale py-12 text-center">
          <p className="text-3xl">📋</p>
          <p className="mt-2 text-gray-500">No applications {filter !== 'all' ? `with status "${filter}"` : 'yet'}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map(app => (
            <div key={app._id} className="flex flex-col gap-3 rounded-2xl border border-primary-pale bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-extrabold text-white text-sm"
                  style={{ background:'linear-gradient(135deg,#04065c,#0077b6)' }}>
                  {app.studentName?.[0] || '?'}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-gray-900">{app.studentName}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-600'}`}>
                      {app.status}
                    </span>
                    <span className="rounded-full bg-primary-pale px-2 py-0.5 text-[10px] font-bold text-primary capitalize">{app.courseType}</span>
                  </div>
                  <p className="text-xs text-gray-500">{app.courseName}</p>
                  <p className="text-[10px] text-gray-400">{new Date(app.createdAt).toLocaleDateString()} · {app.qualification}</p>
                </div>
              </div>
              <button onClick={() => { setSelected(app); setComment(app.adminComment||''); setNewStatus('') }}
                className="shrink-0 rounded-xl bg-primary-pale px-4 py-2 text-xs font-bold text-primary-blue transition hover:bg-primary-pale">
                View Details →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
