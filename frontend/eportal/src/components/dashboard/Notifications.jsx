import { useState, useEffect } from 'react'
import api from '../../utils/api'

export default function Notifications({ setUnread }) {
  const [notifs, setNotifs] = useState([])

  useEffect(() => {
    api.get('/notifications').then(r => setNotifs(r.data)).catch(console.error)
  }, [])

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read')
      setNotifs(prev => prev.map(n => ({ ...n, read: true })))
      setUnread(0)
    } catch (err) {
      console.error(err)
    }
  }

  const TYPE_ICONS = {
    application_submitted: '📋', status_updated: '🔄', under_review: '🔍',
    approved: '✅', rejected: '❌'
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{notifs.length} notification(s)</p>
        {notifs.some(n => !n.read) && (
          <button onClick={markAllRead} className="text-xs font-batchibold text-[#0077b6] hover:underline">
            Mark all read
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-4xl">🔔</p>
          <p className="mt-3 text-lg font-batchibold text-gray-600">No Notifications</p>
          <p className="mt-1 text-sm text-gray-400">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div key={n._id} className={`rounded-xl border p-4 ${n.read ? 'bg-white border-gray-100' : 'bg-[#e0f7fa] border-[#caf0f8]'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{TYPE_ICONS[n.type] || '📬'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{n.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.read && <div className="h-2 w-2 rounded-full bg-[#0077b6]" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

