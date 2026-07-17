import { useState, useEffect } from 'react'
import api from '../../utils/api'

const CATEGORY_META = {
  Urgent:  { pill: 'bg-rose-500/20 text-rose-200 border border-rose-400/30',   icon: '🚨', accent: '#f87171' },
  Exam:    { pill: 'bg-purple-500/20 text-purple-200 border border-purple-400/30', icon: '📝', accent: '#c084fc' },
  Fee:     { pill: 'bg-amber-500/20 text-amber-200 border border-amber-400/30',  icon: '💰', accent: '#fbbf24' },
  Holiday: { pill: 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30',    icon: '🎉', accent: '#67e8f9' },
  Event:   { pill: 'bg-blue-500/20 text-blue-200 border border-blue-400/30',    icon: '📅', accent: '#93c5fd' },
  General: { pill: 'bg-white/10 text-white/70 border border-white/20',          icon: '📢', accent: '#e2e8f0' },
}

const CARD_BG = 'var(--theme-grad-primary)'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/announcements')
      .then(r => setAnnouncements(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-3 max-w-3xl">
      {[1,2,3].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl" style={{ background: CARD_BG, opacity: 0.4 }}/>)}
    </div>
  )

  return (
    <div className="max-w-3xl">
      {announcements.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={{ background: CARD_BG }}>
          <p className="text-4xl">📢</p>
          <p className="mt-3 text-lg font-bold text-white">No Announcements</p>
          <p className="mt-1 text-sm text-white/50">Check back later for updates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(a => {
            const meta = CATEGORY_META[a.category] || CATEGORY_META.General
            return (
              <div key={a._id} className="rounded-2xl p-5 shadow-lg relative overflow-hidden"
                style={{ background: CARD_BG, borderLeft: `4px solid ${meta.accent}` }}>
                {/* subtle glow */}
                <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full opacity-10"
                  style={{ background: `radial-gradient(circle,${meta.accent},transparent 70%)` }}/>
                <div className="relative">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${meta.pill}`}>
                      {meta.icon} {a.category}
                    </span>
                    <span className="text-xs text-white/40">
                      {new Date(a.createdAt).toLocaleDateString('en-US', { weekday:'short', year:'numeric', month:'short', day:'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white">{a.title}</h3>
                  <p className="mt-2 text-sm text-white/75 leading-relaxed">{a.content}</p>
                  <p className="mt-3 text-xs text-white/30">Posted by: {a.postedBy}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
