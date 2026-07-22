import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'
import { FaEnvelope, FaEnvelopeOpen, FaTrash, FaUser, FaBook, FaClock } from 'react-icons/fa'

export default function ContactMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter]     = useState('all') // all | unread | read

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/contact')
      setMessages(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMessages() }, [])

  const handleOpen = async (msg) => {
    setSelected(msg)
    if (!msg.isRead) {
      try {
        await api.patch(`/contact/${msg._id}/read`)
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m))
      } catch {}
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this message?')) return
    try {
      await api.delete(`/contact/${id}`)
      setMessages(prev => prev.filter(m => m._id !== id))
      if (selected?._id === id) setSelected(null)
    } catch {}
  }

  const filtered = messages.filter(m => {
    if (filter === 'unread') return !m.isRead
    if (filter === 'read')   return m.isRead
    return true
  })

  const unreadCount = messages.filter(m => !m.isRead).length

  const fmt = (dateStr) => new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">Contact Messages</h2>
          <p className="text-sm text-gray-500">
            {messages.length} total
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 rounded-xl bg-gray-100 p-1">
          {['all','unread','read'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold capitalize transition ${
                filter === f
                  ? 'bg-white shadow text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <FaEnvelope className="mb-3 text-4xl text-gray-300" />
          <p className="font-semibold text-gray-400">No messages yet</p>
          <p className="text-sm text-gray-300">Messages from the Contact Us form will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">

          {/* Message List */}
          <div className="space-y-2">
            {filtered.map((msg) => (
              <motion.div
                key={msg._id}
                initial={{ opacity:0, y:10 }}
                animate={{ opacity:1, y:0 }}
                onClick={() => handleOpen(msg)}
                className={`cursor-pointer rounded-2xl border p-4 transition hover:shadow-md ${
                  selected?._id === msg._id
                    ? 'border-primary bg-primary/5 shadow-md'
                    : msg.isRead
                      ? 'border-gray-100 bg-white'
                      : 'border-primary-pale bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold"
                    style={{ background:'linear-gradient(135deg,#04065c,#0077b6)' }}>
                    {msg.fullName?.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`truncate text-sm font-bold ${msg.isRead ? 'text-gray-700' : 'text-primary'}`}>
                        {msg.fullName}
                      </p>
                      {!msg.isRead && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary-cyan" />
                      )}
                    </div>
                    <p className="truncate text-xs text-gray-500">{msg.email}</p>
                    {msg.course && (
                      <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {msg.course}
                      </span>
                    )}
                    <p className="mt-1 line-clamp-2 text-xs text-gray-400">{msg.message}</p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {fmt(msg.createdAt)}
                    </span>
                    <button
                      onClick={(e) => handleDelete(msg._id, e)}
                      className="rounded-lg p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detail Panel */}
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected._id}
                initial={{ opacity:0, x:30 }}
                animate={{ opacity:1, x:0 }}
                exit={{   opacity:0, x:30 }}
                className="h-fit rounded-2xl shadow-lg overflow-hidden"
                style={{ background:'linear-gradient(135deg,#04065c 0%,#023e8a 60%,#0077b6 100%)' }}
              >
                {/* Accent bar */}
                <div className="h-1" style={{ background:'linear-gradient(90deg,#48cae4,#0096c7)' }} />

                <div className="p-6 space-y-4">
                  {/* Sender info */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold text-white"
                      style={{ background:'rgba(255,255,255,0.15)' }}>
                      {selected.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-extrabold text-white">{selected.fullName}</p>
                      <p className="text-sm text-primary-light">{selected.email}</p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-3">
                    {selected.course && (
                      <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
                        <FaBook className="text-primary-cyan text-xs" />
                        <span className="text-xs font-semibold text-white">{selected.course}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
                      <FaClock className="text-primary-cyan text-xs" />
                      <span className="text-xs text-white/70">{fmt(selected.createdAt)}</span>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-primary-cyan">Message</p>
                    <p className="text-sm leading-relaxed text-white/85 whitespace-pre-wrap">{selected.message}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <a href={`mailto:${selected.email}?subject=Re: Your message`}
                      className="flex-1 rounded-xl border border-white/30 py-2 text-center text-sm font-bold text-white transition hover:bg-white/10">
                      Reply via Email
                    </a>
                    <button
                      onClick={(e) => handleDelete(selected._id, e)}
                      className="rounded-xl border border-red-400/40 bg-red-500/20 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/30">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity:0 }}
                animate={{ opacity:1 }}
                className="hidden items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center lg:flex lg:flex-col"
              >
                <FaEnvelopeOpen className="mb-3 text-4xl text-gray-200" />
                <p className="text-sm text-gray-400">Click a message to read it</p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}
    </div>
  )
}
