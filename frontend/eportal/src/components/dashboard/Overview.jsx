import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import api from '../../utils/api'

// Status colours — semantic, not theme-controlled (green = approved, red = rejected etc.)
const STATUS_META = {
  Pending:        { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Pending' },
  'Under Review': { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Under Review' },
  Approved:       { color: '#059669', bg: '#f0fdf4', border: '#a7f3d0', label: 'Approved' },
  Rejected:       { color: '#dc2626', bg: '#fff1f2', border: '#fecaca', label: 'Rejected' },
}

function StatCard({ label, value, color, bg, border, icon, delay, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      onClick={onClick}
      className={`rounded-2xl p-4 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      style={{ background: bg, border: `1.5px solid ${border}`, borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <motion.span
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: delay + 0.1, type: 'spring', stiffness: 260 }}
          className="text-3xl font-extrabold"
          style={{ color }}
        >{value ?? '—'}</motion.span>
      </div>
      <p className="mt-1 text-xs font-bold text-gray-500">{label}</p>
    </motion.div>
  )
}

function EnrolledCourseCard({ app, index, theme }) {
  const meta = STATUS_META[app.status] || STATUS_META['Pending']
  // Alternate between primary→secondary and secondary→accent gradients
  const bg = index % 2 === 0
    ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
    : `linear-gradient(135deg, ${theme.secondary}, ${theme.cardDark})`

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(4,6,92,0.18)' }}
      className="relative overflow-hidden rounded-2xl shadow-sm"
      style={{ background: bg }}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
      <div className="relative p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white mb-1">
              {app.courseType || 'Course'}
            </span>
            <h4 className="font-extrabold text-white leading-tight truncate">{app.courseName}</h4>
            <p className="mt-1 text-[11px] text-white/60">
              Applied {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <span className="shrink-0 rounded-xl px-2.5 py-1 text-[10px] font-bold"
            style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
            {meta.label}
          </span>
        </div>
        {app.adminComment && (
          <div className="mt-3 rounded-xl bg-white/10 px-3 py-2">
            <p className="text-[10px] text-white/50 font-bold uppercase mb-0.5">Admin Note</p>
            <p className="text-xs text-white/80 line-clamp-2">{app.adminComment}</p>
          </div>
        )}
        <div className="mt-3 h-1 w-full rounded-full bg-white/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: app.status === 'Approved' ? '100%' : app.status === 'Under Review' ? '66%' : app.status === 'Rejected' ? '100%' : '33%' }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            className="h-1 rounded-full"
            style={{ background: app.status === 'Approved' ? '#4ade80' : app.status === 'Rejected' ? '#f87171' : theme.accent }}
          />
        </div>
      </div>
    </motion.div>
  )
}

/* ─── STUDENT OVERVIEW ─── */
function StudentOverview({ setTab }) {
  const { theme } = useTheme()
  const [courseApps, setCourseApps] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    // Fetch course apps — handle both array response and {applications:[]} shape
    api.get('/course-applications/my')
      .then(r => {
        const data = r.data
        const apps = Array.isArray(data) ? data : (data?.applications || data?.data || [])
        setCourseApps(apps)
      })
      .catch(() => setCourseApps([]))
      .finally(() => setLoading(false))
  }, [])

  const approved = courseApps.filter(a => a.status === 'Approved').length
  const pending  = courseApps.filter(a => a.status === 'Pending').length
  const inReview = courseApps.filter(a => a.status === 'Under Review').length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {/* Stat Cards — semantic colours intentional */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="My Courses"   value={courseApps.length} color={theme.primary}   bg="#eff6ff" border="#bfdbfe" icon="📚" delay={0}    onClick={() => setTab('my-course-apps')} />
        <StatCard label="Approved"     value={approved}          color="#059669" bg="#f0fdf4" border="#a7f3d0" icon="✅" delay={0.05} onClick={() => setTab('my-course-apps')} />
        <StatCard label="Pending"      value={pending}           color="#d97706" bg="#fffbeb" border="#fde68a" icon="⏳" delay={0.1}  onClick={() => setTab('my-course-apps')} />
        <StatCard label="Under Review" value={inReview}          color="#2563eb" bg="#eff6ff" border="#bfdbfe" icon="🔍" delay={0.15} onClick={() => setTab('my-course-apps')} />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-3 text-sm font-extrabold text-gray-700 uppercase tracking-wide">Quick Actions</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Browse Courses',  icon: '🎓', tab: 'browse-courses', color: theme.secondary, bg: theme.bgLight },
            { label: 'My Applications', icon: '📋', tab: 'my-course-apps', color: '#059669',        bg: '#f0fdf4' },
            { label: 'Announcements',   icon: '📢', tab: 'announcements',   color: '#7c3aed',        bg: '#f5f3ff' },
            { label: 'Add Review',      icon: '⭐', tab: 'add-review',      color: '#d97706',        bg: '#fffbeb' },
          ].map((item, i) => (
            <motion.button
              key={item.tab}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}
              onClick={() => setTab(item.tab)}
              className="flex items-center gap-3 rounded-2xl p-4 shadow-sm text-left transition hover:shadow-md"
              style={{ background: item.bg, border: `1.5px solid ${item.color}30` }}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-bold" style={{ color: item.color }}>{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* My Course Applications */}
      {courseApps.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-gray-700 uppercase tracking-wide">My Course Applications</h3>
            <button onClick={() => setTab('my-course-apps')}
              className="text-xs font-bold hover:underline" style={{ color: theme.secondary }}>
              View All →
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {courseApps.slice(0, 6).map((app, i) => (
              <EnrolledCourseCard key={app._id} app={app} index={i} theme={theme} />
            ))}
          </div>
        </div>
      )}

      {courseApps.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed py-14 text-center"
          style={{ borderColor: theme.borderColor }}>
          <p className="text-4xl">🎓</p>
          <p className="mt-3 font-bold text-gray-700">No course applications yet</p>
          <p className="mt-1 text-sm text-gray-400">Browse available courses and apply to get started.</p>
          <button onClick={() => setTab('browse-courses')}
            className="mt-4 rounded-xl px-5 py-2 text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})` }}>
            Browse Courses
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── ADMIN OVERVIEW ─── */
function AdminOverview({ setTab }) {
  const { theme } = useTheme()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/admin-stats')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      </div>
    )
  }

  const s = stats || {}

  return (
    <div className="space-y-7">
      {/* Main Stats */}
      <div>
        <h3 className="mb-3 text-sm font-extrabold text-gray-500 uppercase tracking-wide">Platform Overview</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Students" value={s.totalStudents}  color={theme.primary}   bg={theme.bgLight} border={theme.borderColor} icon="👨‍🎓" delay={0}    onClick={() => setTab('manage-students')} />
          <StatCard label="Total Courses"  value={s.totalCourses}   color={theme.secondary} bg={theme.bgLight} border={theme.borderColor} icon="📚" delay={0.05} onClick={() => setTab('manage-courses')} />
          <StatCard label="Active Courses" value={s.activeCourses}  color="#059669" bg="#f0fdf4" border="#a7f3d0" icon="✅" delay={0.1}  onClick={() => setTab('manage-courses')} />
          <StatCard label="Total Reviews"  value={s.totalReviews}   color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" icon="⭐" delay={0.15} onClick={() => setTab('manage-reviews')} />
        </div>
      </div>

      {/* Application Stats */}
      <div>
        <h3 className="mb-3 text-sm font-extrabold text-gray-500 uppercase tracking-wide">Course Applications</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Pending Applications" value={s.pendingCourseApps}  color="#d97706" bg="#fffbeb" border="#fde68a" icon="⏳" delay={0.2}  onClick={() => setTab('course-apps')} />
          <StatCard label="Approved Enrollments" value={s.approvedCourseApps} color="#059669" bg="#f0fdf4" border="#a7f3d0" icon="🎓" delay={0.25} onClick={() => setTab('course-apps')} />
          <StatCard label="General Applications" value={s.pendingApps}        color="#dc2626" bg="#fff1f2" border="#fecaca" icon="📋" delay={0.3}  onClick={() => setTab('review')} />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-3 text-sm font-extrabold text-gray-500 uppercase tracking-wide">Quick Actions</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Manage Students',     icon: '👥', tab: 'manage-students', color: theme.primary,   bg: theme.bgLight },
            { label: 'Course Applications', icon: '📋', tab: 'course-apps',     color: '#d97706',       bg: '#fffbeb' },
            { label: 'Manage Courses',      icon: '📚', tab: 'manage-courses',  color: theme.secondary, bg: theme.bgLight },
            { label: 'Announcements',       icon: '📢', tab: 'manage-ann',      color: '#7c3aed',       bg: '#f5f3ff' },
          ].map((item, i) => (
            <motion.button
              key={item.tab}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.06 }}
              onClick={() => setTab(item.tab)}
              className="flex items-center gap-3 rounded-2xl p-4 shadow-sm text-left transition hover:shadow-md"
              style={{ background: item.bg, border: `1.5px solid ${item.color}30` }}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-bold" style={{ color: item.color }}>{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {s.recentActivity?.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-wide">Recent Applications</h3>
            <button onClick={() => setTab('course-apps')}
              className="text-xs font-bold hover:underline" style={{ color: theme.secondary }}>
              View All →
            </button>
          </div>
          <div className="rounded-2xl border bg-white shadow-sm overflow-hidden"
            style={{ borderColor: theme.borderColor }}>
            {s.recentActivity.map((item, i) => {
              const meta = STATUS_META[item.status] || STATUS_META['Pending']
              return (
                <div key={item._id} className={`flex items-center gap-4 px-5 py-3.5 ${i !== s.recentActivity.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-extrabold text-white text-sm"
                    style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}>
                    {item.studentName?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{item.studentName}</p>
                    <p className="text-xs text-gray-400 truncate">{item.courseName}</p>
                  </div>
                  <span className="shrink-0 rounded-xl px-2.5 py-1 text-[10px] font-bold"
                    style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
                    {meta.label}
                  </span>
                  <span className="hidden shrink-0 text-[10px] text-gray-400 sm:inline">
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Overview({ user, setTab }) {
  const isAdmin = user?.role === 'admin'
  return isAdmin
    ? <AdminOverview setTab={setTab} />
    : <StudentOverview setTab={setTab} />
}
