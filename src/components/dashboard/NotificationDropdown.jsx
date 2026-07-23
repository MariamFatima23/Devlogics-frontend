import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'

const TYPE_META = {
  // Student
  application_submitted:   { icon: '📋', color: '#0077b6' },
  status_updated:          { icon: '🔄', color: '#d97706' },
  under_review:            { icon: '🔍', color: '#2563eb' },
  approved:                { icon: '✅', color: '#059669' },
  rejected:                { icon: '❌', color: '#dc2626' },
  new_course:              { icon: '🎓', color: '#7c3aed' },
  new_announcement:        { icon: '📢', color: '#0077b6' },
  // Admin
  new_student:             { icon: '👤', color: '#059669' },
  new_review:              { icon: '⭐', color: '#d97706' },
  new_course_application:  { icon: '📝', color: '#0077b6' },
  new_general_application: { icon: '📄', color: '#7c3aed' },
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NotificationDropdown({ unread, setUnread }) {
  const [open, setOpen]       = useState(false)
  const [notifs, setNotifs]   = useState([])
  const [loading, setLoading] = useState(false)
  const dropRef               = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fetch when opened
  useEffect(() => {
    if (!open) return
    setLoading(true)
    api.get('/notifications')
      .then(r => setNotifs(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open])

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read')
      setNotifs(prev => prev.map(n => ({ ...n, read: true })))
      setUnread(0)
    } catch {}
  }

  const markOne = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
      setUnread(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const deleteOne = async (id, e) => {
    e.stopPropagation()
    try {
      await api.delete(`/notifications/${id}`)
      const removed = notifs.find(n => n._id === id)
      setNotifs(prev => prev.filter(n => n._id !== id))
      if (removed && !removed.read) setUnread(prev => Math.max(0, prev - 1))
    } catch {}
  }

  return (
    <div className="relative" ref={dropRef}>
      {/* Bell Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(v => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
      >
        {/* Bell icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Badge */}
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold text-white ring-2 ring-[#04065c]"
            >
              {unread > 99 ? '99+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed left-2 right-2 top-[56px] z-50 overflow-hidden rounded-2xl shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-96"
            style={{ background: 'linear-gradient(135deg,#04065c,#023e8a)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🔔</span>
                <span className="text-sm font-extrabold text-white">Notifications</span>
                {unread > 0 && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {unread} new
                  </span>
                )}
              </div>
              {notifs.some(n => !n.read) && (
                <button onClick={markAllRead}
                  className="text-[11px] font-bold text-primary-cyan hover:text-white transition">
                  Mark all read
                </button>
              )}
            </div>

            {/* Body */}
            <div className="max-h-[55vh] overflow-y-auto sm:max-h-[420px]">
              {loading ? (
                <div className="space-y-2 p-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-white/10" />
                  ))}
                </div>
              ) : notifs.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-3xl">🔔</p>
                  <p className="mt-2 text-sm font-bold text-white/70">No notifications yet</p>
                  <p className="text-xs text-white/40">You're all caught up!</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {notifs.map(n => {
                    const meta = TYPE_META[n.type] || { icon: '🔔', color: '#48cae4' }
                    return (
                      <motion.div
                        key={n._id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => !n.read && markOne(n._id)}
                        className={`group relative flex items-start gap-3 rounded-xl px-3 py-2.5 transition cursor-pointer ${
                          n.read ? 'bg-white/5 hover:bg-white/10' : 'bg-white/15 hover:bg-white/20'
                        }`}
                      >
                        {/* Icon */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base"
                          style={{ background: `${meta.color}25` }}>
                          {meta.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-5">
                          <p className={`text-xs leading-snug ${n.read ? 'text-white/70' : 'font-bold text-white'}`}>
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-[11px] text-white/50 line-clamp-2">{n.message}</p>
                          <p className="mt-1 text-[10px] text-white/30">{timeAgo(n.createdAt)}</p>
                        </div>

                        {/* Unread dot */}
                        {!n.read && (
                          <div className="absolute right-3 top-3.5 h-1.5 w-1.5 rounded-full bg-primary-cyan" />
                        )}

                        {/* Delete button */}
                        <button
                          onClick={(e) => deleteOne(n._id, e)}
                          className="absolute right-2 top-1.5 hidden h-5 w-5 items-center justify-center rounded-md bg-white/10 text-[10px] text-white/40 hover:bg-rose-500/30 hover:text-rose-300 group-hover:flex transition"
                        >
                          ✕
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifs.length > 0 && (
              <div className="border-t border-white/10 px-4 py-2.5 text-center">
                <p className="text-[11px] text-white/30">{notifs.length} total notifications</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
