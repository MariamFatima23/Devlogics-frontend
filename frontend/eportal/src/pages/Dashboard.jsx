import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Overview from '../components/dashboard/Overview'
import MyApplications from '../components/dashboard/MyApplications'
import ReviewApplications from '../components/dashboard/ReviewApplications'
import Profile from '../components/dashboard/Profile'
import Notifications from '../components/dashboard/Notifications'
import Announcements from '../components/dashboard/Announcements'
import FeeStatus from '../components/dashboard/FeeStatus'
import ManageAnnouncements from '../components/dashboard/ManageAnnouncements'
import ManageCourses from '../components/dashboard/ManageCourses'
import ManageServices from '../components/dashboard/ManageServices'
import ManageCourseApplications from '../components/dashboard/ManageCourseApplications'
import ManageReviews from '../components/dashboard/ManageReviews'
import ManageStudentPride from '../components/dashboard/ManageStudentPride'
import AddReview from '../components/dashboard/AddReview'
import MyCourseApplications from '../components/dashboard/MyCourseApplications'
import BrowseCourses from '../components/dashboard/BrowseCourses'

const studentMenu = [
  { icon: '🏠', label: 'Overview',          id: 'overview' },
  { icon: '📚', label: 'Browse Courses',    id: 'browse-courses' },
  { icon: '📋', label: 'My Applications',   id: 'my-course-apps' },
  { icon: '📢', label: 'Announcements',     id: 'announcements' },
  { icon: '🔔', label: 'Notifications',     id: 'notifs' },
  { icon: '⭐', label: 'Add Review',        id: 'add-review' },
  { icon: '👤', label: 'Profile',           id: 'profile' },
]

const adminMenu = [
  { icon: '🏠', label: 'Overview',              id: 'overview' },
  { icon: '✅', label: 'Review Applications',   id: 'review' },
  { icon: '📝', label: 'Course Applications',   id: 'course-apps' },
  { icon: '📚', label: 'Manage Courses',        id: 'manage-courses' },
  { icon: '🛠️', label: 'Manage Services',       id: 'manage-services' },
  { icon: '🌟', label: 'Student Pride',         id: 'student-pride' },
  { icon: '⭐', label: 'Manage Reviews',        id: 'manage-reviews' },
  { icon: '📢', label: 'Manage Announcements',  id: 'manage-ann' },
  { icon: '👤', label: 'Profile',               id: 'profile' },
]

const PAGE_TITLES = {
  'overview':         'Dashboard Overview',
  'browse-courses':   'Available Courses & Internships',
  'my-course-apps':   'My Applications',
  'announcements':    'Announcements',
  'notifs':           'Notifications',
  'add-review':       'Add a Review',
  'profile':          'My Profile',
  'review':           'Review Applications',
  'course-apps':      'Course Applications',
  'manage-ann':       'Manage Announcements',
  'manage-courses':   'Manage Courses',
  'manage-services':  'Manage Services',
  'student-pride':    'Our Students Our Pride',
  'manage-reviews':   'Manage Reviews',
}
  

export default function Dashboard() {
  const { user } = useAuth()
  const [tab, setTab]           = useState('overview')
  const [stats, setStats]       = useState({})
  const [menuOpen, setMenuOpen] = useState(false)
  const [unread, setUnread]     = useState(0)

  const isAdmin  = user?.role === 'admin'
  const menu     = isAdmin ? adminMenu : studentMenu
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  useEffect(() => {
    api.get('/applications/stats').then(r => setStats(r.data)).catch(console.error)
    api.get('/notifications/unread-count').then(r => setUnread(r.data.count)).catch(console.error)
  }, [])

  const switchTab = (id) => { setTab(id); setMenuOpen(false) }

  return (
    /* h-screen = full screen, overflow-hidden = only main content scrolls */
    <div className="flex h-screen overflow-hidden bg-[#f4f7f4]">

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════
          SIDEBAR — full height, IUB dark green
      ══════════════════════════════════════ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col transition-transform duration-300 lg:fixed lg:translate-x-0 lg:inset-y-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'linear-gradient(180deg, #03045e 0%, #023e8a 40%, #0077b6 100%)' }}
      >
        {/* Sidebar Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <img src="/gallery/image.png" alt="IUB" className="h-9 w-9 object-cover rounded" />
            <div>
              <p className="text-sm font-extrabold leading-none text-white">DATAFRAME</p>
              <p className="mt-0.5 text-[10px] font-medium text-[#c9a84c]">Student Portal</p>
            </div>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-xl text-white/50 hover:text-white lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
            Main Menu
          </p>
          {menu.map(item => (
            <button
              key={item.id}
              onClick={() => switchTab(item.id)}
              className={`relative mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                tab === item.id
                  ? 'font-bold shadow-lg'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
              }`}
              style={tab === item.id ? { background: '#48cae4', color: '#03045e' } : {}}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
              {item.id === 'notifs' && unread > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User card — pinned to bottom */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
            {user?.profileImage ? (
              <img
                src={`http://localhost:5000/uploads/${user.profileImage}`}
                alt=""
                className="h-9 w-9 rounded-full object-cover ring-2 ring-[#c9a84c]/40"
              />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: '#c9a84c', color: '#071510' }}
              >
                {initials}
              </div>
            )}
            <div className="flex-1">
              <p className="text-xs font-bold text-white">{user?.name}</p>
              <p className="text-[10px] capitalize text-white/50">
                {user?.role}{user?.rollNumber ? ` · ${user.rollNumber}` : ''}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:ml-72">

        {/* Top Header — same dark green */}
        <header
          className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 px-4 sm:px-6"
          style={{ background: '#03045e' }}
        >
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-white lg:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-white sm:text-base">{PAGE_TITLES[tab]}</h1>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="hidden rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 sm:inline-flex"
                style={{ background: 'rgba(201,168,76,0.2)', color: '#c9a84c', borderColor: 'rgba(201,168,76,0.3)' }}>
                🛡️ Admin
              </span>
            )}
            <span className="hidden text-xs text-white/40 sm:inline">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto w-full max-w-7xl">
            {tab === 'overview'        && <Overview stats={stats} user={user} setTab={switchTab} />}
            {tab === 'browse-courses'  && !isAdmin && <BrowseCourses user={user} />}
            {tab === 'my-course-apps'  && !isAdmin && <MyCourseApplications />}
            {tab === 'announcements'   && <Announcements />}
            {tab === 'notifs'          && <Notifications setUnread={setUnread} />}
            {tab === 'add-review'      && !isAdmin && <AddReview />}
            {tab === 'profile'         && <Profile user={user} />}
            {tab === 'review'          && isAdmin && <ReviewApplications />}
            {tab === 'course-apps'     && isAdmin && <ManageCourseApplications />}
            {tab === 'manage-ann'      && isAdmin && <ManageAnnouncements />}
            {tab === 'manage-courses'  && isAdmin && <ManageCourses />}
            {tab === 'manage-services' && isAdmin && <ManageServices />}
            {tab === 'student-pride'   && isAdmin && <ManageStudentPride />}
            {tab === 'manage-reviews'  && isAdmin && <ManageReviews />}
          </div>
        </main>
      </div>
    </div>
  )
}
