import { useState, useEffect } from 'react'
import api from '../../utils/api'

const CATEGORIES = ['General', 'Exam', 'Fee', 'Holiday', 'Event', 'Urgent']

const CATEGORY_STYLES = {
  Urgent:'bg-rose-100 text-rose-700', Exam:'bg-purple-100 text-purple-700',
  Fee:'bg-amber-100 text-amber-700',  Holiday:'bg-emerald-100 text-emerald-700',
  Event:'bg-blue-100 text-blue-700',  General:'bg-gray-100 text-gray-600',
}

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [showForm, setShowForm]           = useState(false)
  const [formData, setFormData]           = useState({ title: '', content: '', category: 'General' })
  const [loading, setLoading]             = useState(false)
  const [msg, setMsg]                     = useState(null)

  const fetchAll = () =>
    api.get('/announcements').then(r => setAnnouncements(r.data)).catch(console.error)

  useEffect(() => { fetchAll() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/announcements', formData)
      setMsg({ type: 'success', text: 'Announcement posted successfully!' })
      setFormData({ title: '', content: '', category: 'General' })
      setShowForm(false)
      fetchAll()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to post' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return
    try {
      await api.delete(`/announcements/${id}`)
      setAnnouncements(prev => prev.filter(a => a._id !== id))
    } catch { alert('Delete failed') }
  }

  return (
    <div className="max-w-3xl space-y-5">
      {msg && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${msg.type==='success'?'bg-emerald-50 text-emerald-700':'bg-rose-50 text-rose-700'}`}>
          {msg.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{announcements.length} announcement(s)</p>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-[#0077b6] px-4 py-2 text-sm font-batchibold text-white hover:bg-indigo-700 transition">
          {showForm ? 'Cancel' : '+ Post Announcement'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <h3 className="mb-4 font-bold text-gray-900">Post New Announcement</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-batchibold text-gray-700">Title *</label>
                <input type="text" value={formData.title} required placeholder="Announcement title"
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-batchibold text-gray-700">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-batchibold text-gray-700">Content *</label>
              <textarea rows="4" required value={formData.content} placeholder="Announcement details..."
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
            <button type="submit" disabled={loading}
              className="rounded-lg bg-[#0077b6] px-6 py-2.5 text-sm font-batchibold text-white hover:bg-indigo-700 disabled:opacity-60 transition">
              {loading ? 'Posting...' : '📢 Post Announcement'}
            </button>
          </form>
        </div>
      )}

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <p className="text-3xl">📢</p>
          <p className="mt-2 text-gray-500">No announcements posted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a._id} className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${CATEGORY_STYLES[a.category]||'bg-gray-100 text-gray-600'}`}>
                      {a.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(a.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900">{a.title}</h4>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{a.content}</p>
                </div>
                <button onClick={() => handleDelete(a._id)}
                  className="shrink-0 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-batchibold text-rose-600 hover:bg-rose-50 transition">
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

