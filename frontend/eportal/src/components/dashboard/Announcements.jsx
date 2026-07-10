import { useState, useEffect } from 'react'
import api from '../../utils/api'

const CATEGORY_STYLES = {
  Urgent:  { bg: 'bg-rose-100 text-rose-700',    border: 'border-rose-400',    icon: '🚨' },
  Exam:    { bg: 'bg-purple-100 text-purple-700', border: 'border-purple-400',  icon: '📝' },
  Fee:     { bg: 'bg-amber-100 text-amber-700',   border: 'border-amber-400',   icon: '💰' },
  Holiday: { bg: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-400', icon: '🎉' },
  Event:   { bg: 'bg-blue-100 text-blue-700',     border: 'border-blue-400',    icon: '📅' },
  General: { bg: 'bg-gray-100 text-gray-600',     border: 'border-gray-300',    icon: '📢' },
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/announcements')
      .then(r => setAnnouncements(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-16 text-center text-gray-500">Loading announcements...</div>

  return (
    <div className="max-w-3xl">
      {announcements.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-4xl">📢</p>
          <p className="mt-3 text-lg font-batchibold text-gray-600">No Announcements</p>
          <p className="mt-1 text-sm text-gray-400">Check back later for Course updates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(a => {
            const style = CATEGORY_STYLES[a.category] || CATEGORY_STYLES.General
            return (
              <div key={a._id} className={`rounded-xl border-l-4 bg-white p-5 shadow-sm ${style.border}`}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${style.bg}`}>
                    {style.icon} {a.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(a.createdAt).toLocaleDateString('en-US', { weekday:'short', year:'numeric', month:'short', day:'numeric' })}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900">{a.title}</h3>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">{a.content}</p>
                <p className="mt-2 text-xs text-gray-400">Posted by: {a.postedBy}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
