import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api, { fileUrl } from '../../utils/api'
import toast from 'react-hot-toast'

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

export default function ManageStudents() {
  const [students, setStudents]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [debouncedSearch, setDebounced] = useState('')
  const [selected, setSelected]     = useState(null)
  const [selectedApps, setSelectedApps] = useState([])
  const [appsLoading, setAppsLoading]   = useState(false)
  const [blockLoading, setBlockLoading] = useState(null)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ role: 'student' })
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await api.get(`/users?${params}`)
      setStudents(res.data || [])
    } catch {
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  const openStudent = async (student) => {
    setSelected(student)
    setAppsLoading(true)
    try {
      const res = await api.get(`/course-applications/all?studentId=${student._id}`)
      setSelectedApps(res.data || [])
    } catch {
      setSelectedApps([])
    } finally {
      setAppsLoading(false)
    }
  }

  const handleBlock = async (student) => {
    setBlockLoading(student._id)
    try {
      const res = await api.patch(`/users/${student._id}/block`)
      toast.success(res.data.message)
      // Update local list
      setStudents(prev => prev.map(s =>
        s._id === student._id ? { ...s, isBlocked: res.data.isBlocked } : s
      ))
      if (selected?._id === student._id) {
        setSelected(prev => ({ ...prev, isBlocked: res.data.isBlocked }))
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    } finally {
      setBlockLoading(null)
    }
  }

  const STATUS_COLORS = {
    Pending:        'bg-amber-100 text-amber-700',
    'Under Review': 'bg-blue-100 text-blue-700',
    Approved:       'bg-green-100 text-green-700',
    Rejected:       'bg-rose-100 text-rose-700',
  }

  return (
    <div className="space-y-5">

      {/* Header + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${students.length} student${students.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20"
          />
        </div>
      </div>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(3,4,94,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
                <h3 className="text-lg font-extrabold text-gray-900">Student Profile</h3>
                <button onClick={() => setSelected(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Avatar + basic info */}
                <div className="flex items-center gap-4">
                  {selected.profileImage ? (
                    <img src={fileUrl(selected.profileImage)} alt=""
                      className="h-16 w-16 rounded-2xl object-cover ring-2 ring-primary-blue/20" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-extrabold text-white"
                      style={{ background: 'linear-gradient(135deg,#04065c,#0077b6)' }}>
                      {selected.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-extrabold text-gray-900">{selected.name}</h4>
                      {selected.isBlocked && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                          🚫 Blocked
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{selected.email}</p>
                    {selected.rollNumber && (
                      <p className="text-xs text-primary-blue font-semibold mt-0.5">{selected.rollNumber}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleBlock(selected)}
                    disabled={blockLoading === selected._id}
                    className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition disabled:opacity-50 ${
                      selected.isBlocked
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                    }`}
                  >
                    {blockLoading === selected._id ? '...' : selected.isBlocked ? '✅ Unblock' : '🚫 Block'}
                  </button>
                </div>

                {/* Details grid */}
                <div className="grid gap-3 rounded-2xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
                  {[
                    ['Phone',      selected.phone || '—'],
                    ['Department', selected.department || '—'],
                    ['Semester',   selected.batchester || '—'],
                    ['Roll No.',   selected.rollNumber || '—'],
                    ['Role',       selected.role],
                    ['Joined',     new Date(selected.createdAt).toLocaleDateString('en-PK', { day:'numeric', month:'long', year:'numeric' })],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                      <p className="mt-0.5 font-semibold text-gray-800">{val}</p>
                    </div>
                  ))}
                </div>

                {/* Course Applications */}
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                    Course Applications {!appsLoading && `(${selectedApps.length})`}
                  </p>
                  {appsLoading ? (
                    <div className="space-y-2">
                      {[1,2].map(i => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}
                    </div>
                  ) : selectedApps.length === 0 ? (
                    <p className="text-sm text-gray-400">No course applications yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedApps.map(app => (
                        <div key={app._id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">{app.courseName}</p>
                            <p className="text-[10px] text-gray-400 capitalize">{app.courseType} · {new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-600'}`}>
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Students Table */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-primary-pale py-14 text-center">
          <p className="text-4xl">👤</p>
          <p className="mt-3 font-bold text-gray-700">No students found</p>
          <p className="mt-1 text-sm text-gray-400">
            {debouncedSearch ? `No results for "${debouncedSearch}"` : 'No registered students yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((student, i) => (
            <motion.div
              key={student._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                {student.profileImage ? (
                  <img src={fileUrl(student.profileImage)} alt=""
                    className="h-10 w-10 shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white"
                    style={{ background: 'linear-gradient(135deg,#04065c,#0077b6)' }}>
                    {student.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-gray-900 truncate">{student.name}</p>
                    {student.isBlocked && (
                      <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-600">Blocked</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{student.email}</p>
                  {student.rollNumber && (
                    <p className="text-[10px] text-primary-blue font-semibold">{student.rollNumber} · {student.department || ''}</p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span className="text-[10px] text-gray-400">
                  Joined {new Date(student.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <button
                  onClick={() => openStudent(student)}
                  className="rounded-lg bg-primary-pale px-3 py-1.5 text-xs font-semibold text-primary-blue hover:bg-blue-100 transition">
                  View Profile →
                </button>
                <button
                  onClick={() => handleBlock(student)}
                  disabled={blockLoading === student._id}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                    student.isBlocked
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                  }`}
                >
                  {blockLoading === student._id ? '...' : student.isBlocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
