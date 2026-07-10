import { useState, useEffect } from 'react'
import api from '../../utils/api'

const STATUS_COLORS = {
  Pending:'bg-amber-100 text-amber-700',
  'Under Review':'bg-blue-100 text-blue-700',
  Approved:'bg-emerald-100 text-emerald-700',
  Rejected:'bg-rose-100 text-rose-700',
}

export default function Overview({ stats, user, setTab }) {
  const isAdmin  = user?.role === 'admin'
  const initials = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'U'

  const [announcements, setAnnouncements] = useState([])
  const [recentApps, setRecentApps]       = useState([])
  const [portalStats, setPortalStats]     = useState({ courses:0, services:0, students:0, reviews:0 })

  useEffect(() => {
    api.get('/announcements').then(r => setAnnouncements(r.data.slice(0,3))).catch(()=>{})

    if (!isAdmin) {
      api.get('/applications/my-applications').then(r => setRecentApps(r.data.slice(0,3))).catch(()=>{})
    } else {
      api.get('/applications?status=Pending').then(r => setRecentApps(r.data.slice(0,3))).catch(()=>{})
      // Admin sees portal-wide stats
      Promise.all([
        api.get('/courses/all').catch(()=>({ data:[] })),
        api.get('/services/all').catch(()=>({ data:[] })),
        api.get('/student-pride/all').catch(()=>({ data:[] })),
        api.get('/reviews/all').catch(()=>({ data:[] })),
      ]).then(([c,s,sp,r]) => {
        setPortalStats({
          courses:  c.data.length,
          services: s.data.length,
          students: sp.data.length,
          reviews:  r.data.filter(rv=>rv.isApproved).length,
        })
      })
    }
  }, [isAdmin])

  const appStatCards = [
    { label:'Total',    value: stats.total    || 0, icon:'📋', color:'#0077b6' },
    { label:'Pending',  value: stats.pending  || 0, icon:'⏳', color:'#d97706' },
    { label:'Approved', value: stats.approved || 0, icon:'✅', color:'#059669' },
    { label:'Rejected', value: stats.rejected || 0, icon:'❌', color:'#dc2626' },
  ]

  const adminPortalCards = [
    { label:'Courses on Portal',  value: portalStats.courses,  icon:'📚', tab:'manage-courses',  color:'#0077b6' },
    { label:'Active Services',    value: portalStats.services, icon:'🛠️', tab:'manage-services', color:'#0096c7' },
    { label:'Student Pride',      value: portalStats.students, icon:'🌟', tab:'student-pride',   color:'#023e8a' },
    { label:'Approved Reviews',   value: portalStats.reviews,  icon:'⭐', tab:'manage-reviews',  color:'#03045e' },
  ]

  return (
    <>
      <div className="space-y-6">

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl p-5 sm:p-7 text-white shadow-lg"
          style={{ background:'linear-gradient(135deg,#03045e 0%,#023e8a 50%,#0077b6 100%)' }}>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 right-20 h-20 w-20 rounded-full bg-white/5" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[#90e0ef]">Welcome back,</p>
              <h2 className="text-xl font-extrabold sm:text-2xl">{user?.name} 👋</h2>
              {isAdmin
                ? <p className="mt-1 text-xs text-[#90e0ef]">DevLogics Administrator</p>
                : <p className="mt-1 text-xs text-[#90e0ef]">{user?.department ? `${user.department} · ` : ''}{user?.rollNumber || 'Student'}</p>
              }
            </div>
            {user?.profileImage ? (
              <img src={`http://localhost:5000/uploads/${user.profileImage}`} alt=""
                className="h-14 w-14 rounded-full object-cover ring-2 ring-[#48cae4]/40" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold ring-2 ring-[#48cae4]/30"
                style={{ background:'rgba(72,202,228,0.2)', color:'#48cae4' }}>
                {initials}
              </div>
            )}
          </div>
        </div>

        {/* ── ADMIN: Portal content stats ── */}
        {isAdmin && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {adminPortalCards.map((s,i) => (
              <button key={i} onClick={() => setTab(s.tab)}
                className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition text-left">
                <div className="mb-2 text-2xl">{s.icon}</div>
                <p className="text-2xl font-extrabold" style={{ color:s.color }}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </button>
            ))}
          </div>
        )}

        {/* Application stats — both roles */}
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
            {isAdmin ? 'Service Applications' : 'My Applications'}
          </p>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {appStatCards.map((s,i) => (
              <div key={i} className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
                <div className="mb-2 text-xl">{s.icon}</div>
                <p className="text-2xl font-extrabold" style={{ color:s.color }}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label} Applications</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">

          {/* Recent applications */}
          <div className="lg:col-span-2 rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{isAdmin ? 'Pending Applications' : 'Recent Applications'}</h3>
              <button onClick={() => setTab(isAdmin ? 'review' : 'my-apps')}
                className="text-xs font-bold text-[#0077b6] hover:underline">View All →</button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentApps.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-3xl">📭</p>
                  <p className="mt-2 text-sm text-gray-400">{isAdmin ? 'No pending applications' : 'No applications yet'}</p>
                </div>
              ) : (
                recentApps.map(app => (
                  <div key={app._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{app.title}</p>
                      <p className="text-xs text-gray-400">{app.type} · {new Date(app.createdAt).toLocaleDateString()}</p>
                      {isAdmin && <p className="text-xs text-gray-400">{app.studentName}</p>}
                    </div>
                    <span className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_COLORS[app.status]||'bg-gray-100 text-gray-600'}`}>{app.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Quick actions */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
              <h3 className="mb-3 font-bold text-gray-900">Quick Actions</h3>
              <div className="space-y-2">
                {isAdmin ? (
                  <>
                    <button onClick={() => setTab('course-apps')} className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90" style={{ background:'linear-gradient(135deg,#0077b6,#03045e)' }}>
                      📝 Course Applications
                    </button>
                    <button onClick={() => setTab('manage-courses')} className="flex w-full items-center gap-2 rounded-xl border-2 border-[#caf0f8] px-4 py-2.5 text-sm font-bold text-[#0077b6] hover:bg-[#f0f9ff]">
                      📚 Add New Course
                    </button>
                    <button onClick={() => setTab('student-pride')} className="flex w-full items-center gap-2 rounded-xl border-2 border-[#caf0f8] px-4 py-2.5 text-sm font-bold text-[#0077b6] hover:bg-[#f0f9ff]">
                      🌟 Manage Student Pride
                    </button>
                    <button onClick={() => setTab('manage-reviews')} className="flex w-full items-center gap-2 rounded-xl border-2 border-[#caf0f8] px-4 py-2.5 text-sm font-bold text-[#0077b6] hover:bg-[#f0f9ff]">
                      ⭐ Approve Reviews
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setTab('browse-courses')} className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90" style={{ background:'linear-gradient(135deg,#0077b6,#03045e)' }}>
                      📚 Browse Courses
                    </button>
                    <button onClick={() => setTab('my-course-apps')} className="flex w-full items-center gap-2 rounded-xl border-2 border-[#caf0f8] px-4 py-2.5 text-sm font-bold text-[#0077b6] hover:bg-[#f0f9ff]">
                      📋 My Applications
                    </button>
                    <button onClick={() => setTab('add-review')} className="flex w-full items-center gap-2 rounded-xl border-2 border-[#caf0f8] px-4 py-2.5 text-sm font-bold text-[#0077b6] hover:bg-[#f0f9ff]">
                      ⭐ Add a Review
                    </button>
                    <button onClick={() => setTab('notifs')} className="flex w-full items-center gap-2 rounded-xl border-2 border-[#caf0f8] px-4 py-2.5 text-sm font-bold text-[#0077b6] hover:bg-[#f0f9ff]">
                      🔔 Notifications
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Latest announcements */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Latest Notice</h3>
                <button onClick={() => setTab(isAdmin ? 'manage-ann' : 'announcements')} className="text-xs font-bold text-[#0077b6] hover:underline">All →</button>
              </div>
              {announcements.length === 0 ? (
                <p className="text-sm text-gray-400">No announcements yet.</p>
              ) : announcements.map(a => (
                <div key={a._id} className="mb-3 border-l-2 border-[#0077b6] pl-3">
                  <p className="text-xs font-bold text-gray-900">{a.title}</p>
                  <p className="text-[10px] text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── STUDENT: course summary card ── */}
        {!isAdmin && (
          <button onClick={() => setTab('browse-courses')}
            className="w-full rounded-2xl p-5 text-left shadow-sm border border-[#caf0f8] transition hover:shadow-md"
            style={{ background:'linear-gradient(135deg,#03045e,#0077b6)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#90e0ef]">Available Now</p>
                <h3 className="mt-1 text-xl font-extrabold text-white">Browse Courses &amp; Internships</h3>
                <p className="mt-1 text-sm text-white/70">Click Apply Now on any course — form opens, fill details, submit to admin</p>
              </div>
              <span className="text-4xl">📚</span>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#48cae4] px-5 py-2 text-sm font-extrabold text-[#03045e]">
              View All Courses →
            </div>
          </button>
        )}

      </div>
    </>
  )
}
