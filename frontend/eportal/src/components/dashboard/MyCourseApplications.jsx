import { useState, useEffect } from 'react'
import api from '../../utils/api'

const STATUS_COLORS = {
  Pending:        'bg-amber-100 text-amber-700',
  'Under Review': 'bg-blue-100 text-blue-700',
  Approved:       'bg-emerald-100 text-emerald-700',
  Rejected:       'bg-rose-100 text-rose-700',
}

export default function MyCourseApplications() {
  const [apps, setApps]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get('/course-applications/my')
      .then(r => setApps(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2].map(i => <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />)}
      </div>
    )
  }

  if (!apps.length) {
    return (
      <div className="rounded-xl border-2 border-dashed border-[#caf0f8] py-16 text-center">
        <p className="text-4xl">📋</p>
        <p className="mt-3 font-bold text-gray-700">No course applications yet</p>
        <p className="mt-1 text-sm text-gray-400">Browse courses on the home page and apply.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {apps.map(app => (
        <div key={app._id} className="overflow-hidden rounded-2xl border border-[#caf0f8] bg-white shadow-sm">
          <button
            onClick={() => setExpanded(expanded === app._id ? null : app._id)}
            className="flex w-full items-center gap-4 p-4 text-left hover:bg-[#f0f9ff] transition">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-extrabold text-white"
              style={{ background:'linear-gradient(135deg,#03045e,#0077b6)' }}>
              📚
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-gray-900">{app.courseName}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[app.status]||'bg-gray-100 text-gray-600'}`}>
                  {app.status}
                </span>
                <span className="rounded-full bg-[#e0f7fa] px-2 py-0.5 text-[10px] font-bold text-[#03045e] capitalize">{app.courseType}</span>
              </div>
              <p className="text-xs text-gray-400">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
            </div>
            <span className="text-gray-400">{expanded===app._id?'▲':'▼'}</span>
          </button>

          {expanded === app._id && (
            <div className="border-t border-[#caf0f8] px-4 pb-4 pt-3 space-y-3">
              {/* Fields */}
              <div className="grid gap-3 rounded-xl bg-[#f0f9ff] p-4 text-sm sm:grid-cols-2">
                {[
                  ['Qualification', app.qualification],
                  ['Experience', app.experience||'None'],
                  ['Phone', app.phone],
                  ['Payment Method', app.paymentMethod||'—'],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                    <p className="font-medium text-gray-800">{val}</p>
                  </div>
                ))}
              </div>

              {/* Admin comment */}
              {app.adminComment && (
                <div className="rounded-xl border border-[#caf0f8] bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Admin Feedback</p>
                  <p className="mt-1 text-sm text-gray-700">{app.adminComment}</p>
                </div>
              )}

              {/* CV link */}
              {app.cvFile && (
                <a href={`http://localhost:5000/uploads/${app.cvFile}`} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#e0f7fa] px-4 py-2 text-sm font-semibold text-[#0077b6] hover:bg-[#caf0f8]">
                  📄 View My CV
                </a>
              )}

              {/* Timeline */}
              {app.timeline?.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Status Timeline</p>
                  <div className="space-y-2">
                    {app.timeline.map((t, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs">
                        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#0077b6]" />
                        <div>
                          <span className="font-bold text-gray-800">{t.status}</span>
                          {t.comment && <span className="text-gray-500"> — {t.comment}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
