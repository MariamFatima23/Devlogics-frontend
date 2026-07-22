import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Overview from '../components/dashboard/Overview'
import ReviewApplications from '../components/dashboard/ReviewApplications'
import Profile from '../components/dashboard/Profile'
import Announcements from '../components/dashboard/Announcements'
import ManageAnnouncements from '../components/dashboard/ManageAnnouncements'
import ManageCourses from '../components/dashboard/ManageCourses'
import ManageServices from '../components/dashboard/ManageServices'
import ManageCourseApplications from '../components/dashboard/ManageCourseApplications'
import ManageReviews from '../components/dashboard/ManageReviews'
import ManageStudentPride from '../components/dashboard/ManageStudentPride'
import AddReview from '../components/dashboard/AddReview'
import MyCourseApplications from '../components/dashboard/MyCourseApplications'
import ManageSiteSettings from '../components/dashboard/ManageSiteSettings'
import BrowseCourses from '../components/dashboard/BrowseCourses'
import ContactMessages from '../components/dashboard/ContactMessages'
import ManageStudents from '../components/dashboard/ManageStudents'
import NotificationDropdown from '../components/dashboard/NotificationDropdown'

/* ── Icons (inline SVG helpers) ─────────────────────────── */
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const studentMenu = [
  {
    id: 'overview', label: 'Overview',
    icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />,
  },
  {
    id: 'browse-courses', label: 'Courses',
    icon: <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  },
  {
    id: 'my-course-apps', label: 'My Applications',
    icon: <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
  },
  {
    id: 'announcements', label: 'Announcements',
    icon: <Icon d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />,
  },
  {
    id: 'add-review', label: 'Add Review',
    icon: <Icon d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
  },
  {
    id: 'profile', label: 'My Profile',
    icon: <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  },
]

const adminMenu = [
  { id: 'overview',         label: 'Overview',             icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /> },
  { id: 'manage-students',  label: 'Manage Students',      icon: <Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /> },
  { id: 'review',           label: 'Review Applications',  icon: <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /> },
  { id: 'course-apps',      label: 'Course Applications',  icon: <Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /> },
  { id: 'manage-courses',   label: 'Manage Courses',       icon: <Icon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> },
  { id: 'manage-services',  label: 'Manage Services',      icon: <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> },
  { id: 'student-pride',    label: 'Student Pride',        icon: <Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /> },
  { id: 'manage-reviews',   label: 'Manage Reviews',       icon: <Icon d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /> },
  { id: 'manage-ann',       label: 'Announcements',        icon: <Icon d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /> },
  { id: 'site-settings',    label: 'Site Settings',        icon: <Icon d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /> },
  { id: 'contact-messages', label: 'Contact Messages',     icon: <Icon d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
  { id: 'profile',          label: 'Profile',              icon: <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
]

const PAGE_TITLES = {
  'overview': 'Dashboard', 'browse-courses': 'Courses', 'my-course-apps': 'My Applications',
  'add-review': 'Add Review', 'announcements': 'Announcements', 'notifs': 'Notifications',
  'profile': 'My Profile', 'review': 'Review Applications', 'course-apps': 'Course Applications',
  'manage-ann': 'Manage Announcements', 'manage-courses': 'Manage Courses',
  'manage-services': 'Manage Services', 'student-pride': 'Student Pride',
  'site-settings': 'Site Settings', 'contact-messages': 'Contact Messages',
  'manage-students': 'Manage Students',
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const [tab, setTab]               = useState('overview')
  const [menuOpen, setMenuOpen]     = useState(false)
  const [unread, setUnread]         = useState(0)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [isDesktop, setIsDesktop]   = useState(() => window.innerWidth >= 1024)

  const isAdmin  = user?.role === 'admin'
  const menu     = isAdmin ? adminMenu : studentMenu
  const BASE     = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
  const fileUrl  = (path) => (path && path.startsWith('http')) ? path : (path ? `${BASE}/uploads/${path}` : null)
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  // Track screen size to conditionally render content once
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    api.get('/notifications/unread-count').then(r => setUnread(r.data.count)).catch(() => {})
  }, [])

  // Listen for goto-profile event from CourseApplyModal
  useEffect(() => {
    const handler = () => switchTab('profile')
    window.addEventListener('goto-profile', handler)
    return () => window.removeEventListener('goto-profile', handler)
  }, [])

  const switchTab = (id) => { setTab(id); setMenuOpen(false) }
  const handleLogout = () => { logout(); navigate('/') }
  const toggleSidebar = () => setSidebarExpanded(v => !v)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--theme-bg-light)' }}>

      {/* Mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ══════════════════════════════
          SIDEBAR — Desktop: icon-only, hover to expand (overlay)
      ══════════════════════════════ */}
      <motion.aside
        animate={{ width: sidebarExpanded ? 240 : 56 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="hidden lg:flex fixed top-[64px] bottom-0 left-0 z-40 flex-col"
        style={{ background: 'var(--theme-grad-sidebar)', overflowX: 'hidden', overflowY: 'hidden' }}
      >
        {/* ── Top toggle button ── */}
        <div className="shrink-0 flex items-center border-b border-white/10 px-2 py-2"
          style={{ justifyContent: sidebarExpanded ? 'flex-end' : 'center' }}>
          <motion.button
            onClick={toggleSidebar}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.1 }}
            title={sidebarExpanded ? 'Collapse' : 'Expand'}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/25 bg-white/10 text-white hover:bg-white/25 transition"
          >
            <motion.span
              animate={{ rotate: sidebarExpanded ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="flex items-center justify-center"
            >
              <Icon d="M9 18l6-6-6-6" size={13} />
            </motion.span>
          </motion.button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
          <motion.p
            animate={{ opacity: sidebarExpanded ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-white/30 whitespace-nowrap"
          >
            {isAdmin ? 'Admin Panel' : 'Student Portal'}
          </motion.p>
          {menu.map((item) => {
            const active = tab === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => switchTab(item.id)}
                animate={
                  active
                    ? {
                        backgroundColor: 'rgba(72,202,228,0.18)',
                        boxShadow: '0 0 14px 3px rgba(72,202,228,0.22)',
                        color: '#48cae4',
                      }
                    : {
                        backgroundColor: 'rgba(255,255,255,0)',
                        boxShadow: '0 0 0px 0px rgba(72,202,228,0)',
                        color: 'rgba(255,255,255,1)',
                      }
                }
                whileHover={
                  !active
                    ? {
                        backgroundColor: 'rgba(255,255,255,0.09)',
                        color: 'rgba(255,255,255,1)',
                      }
                    : {}
                }
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                className="relative flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-sm font-semibold origin-center"
                title={!sidebarExpanded ? item.label : undefined}
              >
                {/* Left accent bar */}
                <motion.span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                  animate={active
                    ? { height: '60%', opacity: 1, x: 0 }
                    : { height: '0%', opacity: 0, x: -4 }
                  }
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  style={{ background: 'linear-gradient(180deg,#caf0f8,#48cae4)' }}
                />

                {/* Icon */}
                <motion.span
                  animate={active
                    ? { scale: 1.18, filter: 'drop-shadow(0 0 7px rgba(72,202,228,0.9))' }
                    : { scale: 1,    filter: 'drop-shadow(0 0 0px rgba(72,202,228,0))' }
                  }
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  className="relative z-10 shrink-0"
                >
                  {item.icon}
                </motion.span>

                {/* Label — hidden when collapsed */}
                <motion.span
                  animate={{ opacity: sidebarExpanded ? 1 : 0, width: sidebarExpanded ? 'auto' : 0 }}
                  transition={{ duration: 0.15 }}
                  className={`relative z-10 flex-1 text-left whitespace-nowrap overflow-hidden ${active ? 'font-bold' : 'font-semibold'}`}
                >
                  {item.label}
                </motion.span>

                {/* Pulsing dot — only on active, only when expanded */}
                <motion.span
                  animate={active && sidebarExpanded ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="relative z-10 flex h-2 w-2 shrink-0 items-center justify-center"
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
                </motion.span>
              </motion.button>
            )
          })}
        </nav>

        {/* Logout — pinned bottom */}
        <div className="shrink-0 border-t border-white/10 p-2">

          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-500/15 hover:text-rose-200"
            title={!sidebarExpanded ? 'Logout' : undefined}
          >
            <span className="shrink-0">
              <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </span>
            <motion.span
              animate={{ opacity: sidebarExpanded ? 1 : 0, width: sidebarExpanded ? 'auto' : 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden whitespace-nowrap"
            >
              Logout
            </motion.span>
          </motion.button>
        </div>
      </motion.aside>

      {/* ── Mobile sidebar (hamburger, same as before) ── */}
      <motion.aside
        initial={false}
        animate={{ x: menuOpen ? 0 : -288 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col lg:hidden"
        style={{ background: 'var(--theme-grad-sidebar)' }}
      >
        {/* Logo header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <img
            src="/gallery/logo1.png" alt="logo"
            style={{ height: '60px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
          />
          <button onClick={() => setMenuOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white">
            <Icon d="M6 18L18 6M6 6l12 12" size={16} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
            {isAdmin ? 'Admin Panel' : 'Student Portal'}
          </p>
          {menu.map((item) => {
            const active = tab === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => switchTab(item.id)}
                animate={
                  active
                    ? {
                        backgroundColor: 'rgba(72,202,228,0.18)',
                        boxShadow: '0 0 14px 3px rgba(72,202,228,0.22)',
                        color: '#48cae4',
                      }
                    : {
                        backgroundColor: 'rgba(255,255,255,0)',
                        boxShadow: '0 0 0px 0px rgba(72,202,228,0)',
                        color: 'rgba(255,255,255,0.85)',
                      }
                }
                whileHover={
                  !active
                    ? {
                        backgroundColor: 'rgba(255,255,255,0.09)',
                        color: 'rgba(255,255,255,1)',
                      }
                    : {}
                }
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                className="relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold origin-center"
              >
                <motion.span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                  animate={active
                    ? { height: '60%', opacity: 1, x: 0 }
                    : { height: '0%', opacity: 0, x: -4 }
                  }
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  style={{ background: 'linear-gradient(180deg,#caf0f8,#48cae4)' }}
                />
                <motion.span
                  animate={active
                    ? { scale: 1.18, filter: 'drop-shadow(0 0 7px rgba(72,202,228,0.9))' }
                    : { scale: 1,    filter: 'drop-shadow(0 0 0px rgba(72,202,228,0))' }
                  }
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  className="relative z-10 shrink-0"
                >
                  {item.icon}
                </motion.span>
                <motion.span
                  animate={active ? { x: 2 } : { x: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  className={`relative z-10 flex-1 text-left ${active ? 'font-bold' : 'font-semibold'}`}
                >
                  {item.label}
                </motion.span>
                <motion.span
                  animate={active ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="relative z-10 flex h-2 w-2 shrink-0 items-center justify-center"
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
                </motion.span>
              </motion.button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-500/15 hover:text-rose-200"
          >
            <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            Logout
          </motion.button>
        </div>
      </motion.aside>

      {/* ══════════════════════════════
          MAIN CONTENT — margin shifts with sidebar expand/collapse
      ══════════════════════════════ */}
      <motion.div
        animate={{ marginLeft: sidebarExpanded ? 240 : 56 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="hidden lg:flex min-w-0 flex-1 flex-col overflow-hidden"
      >
        {/* ── FULL-WIDTH TOP NAVBAR ── */}
        <header
          className="fixed top-0 left-0 right-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 sm:px-6"
          style={{ background: 'var(--theme-grad-topbar)' }}
        >
          {/* Left: toggle button + logo + page title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/20 text-white lg:hidden">
              <Icon d="M4 6h16M4 12h16M4 18h16" />
            </button>

            {/* Desktop sidebar toggle — REMOVED from navbar, now on sidebar */}

            {/* Logo — desktop only, in navbar */}
            <img
              src="/gallery/logo1.png" alt="logo"
              className="hidden lg:block shrink-0 h-10 w-auto object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />

            {/* Divider */}
            <div className="hidden lg:block h-5 w-px bg-white/20" />

            {/* Page title */}
            <h1 className="truncate text-sm font-bold text-white sm:text-base">
              {PAGE_TITLES[tab]}
            </h1>
          </div>

          {/* Right side — date + profile */}
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-white/40 sm:inline">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>

            {isAdmin && (
              <span className="hidden items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 sm:inline-flex"
                style={{ background: 'rgba(72,202,228,0.2)', color: '#48cae4', borderColor: 'rgba(72,202,228,0.3)' }}>
                🛡️ Admin
              </span>
            )}

            {/* 🔔 Notification Bell */}
            <NotificationDropdown unread={unread} setUnread={setUnread} />

            {/* Profile avatar — click goes directly to profile tab */}
            {/* Profile avatar — click directly opens profile tab */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => switchTab('profile')}
              className="flex items-center gap-2 rounded-xl bg-white/10 pl-1.5 pr-3 py-1 ring-1 ring-white/20 hover:bg-white/20 transition"
              title="My Profile"
            >
              {user?.profileImage ? (
                <img src={fileUrl(user.profileImage)} alt=""
                  className="h-7 w-7 rounded-lg object-cover" />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-extrabold"
                  style={{ background: 'var(--theme-accent)', color: 'var(--theme-primary)' }}>
                  {initials}
                </div>
              )}
              <span className="hidden max-w-[90px] truncate text-xs font-semibold text-white sm:inline">
                {user?.name?.split(' ')[0]}
              </span>
            </motion.button>
          </div>
        </header>
        

        {/* ── SCROLLABLE CONTENT — only rendered on desktop ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 mt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="mx-auto w-full max-w-7xl"
            >
              {isDesktop && tab === 'overview'         && <Overview user={user} setTab={switchTab} />}
              {isDesktop && tab === 'browse-courses'   && !isAdmin && <BrowseCourses user={user} />}
              {isDesktop && tab === 'my-course-apps'   && !isAdmin && <MyCourseApplications />}
              {isDesktop && tab === 'add-review'       && !isAdmin && <AddReview />}
              {isDesktop && tab === 'announcements'    && <Announcements />}
              {isDesktop && tab === 'profile'          && <Profile />}
              {isDesktop && tab === 'review'           && isAdmin && <ReviewApplications />}
              {isDesktop && tab === 'course-apps'      && isAdmin && <ManageCourseApplications />}
              {isDesktop && tab === 'manage-ann'       && isAdmin && <ManageAnnouncements />}
              {isDesktop && tab === 'manage-courses'   && isAdmin && <ManageCourses />}
              {isDesktop && tab === 'manage-services'  && isAdmin && <ManageServices />}
              {isDesktop && tab === 'student-pride'    && isAdmin && <ManageStudentPride />}
              {isDesktop && tab === 'manage-reviews'   && isAdmin && <ManageReviews />}
              {isDesktop && tab === 'manage-students'  && isAdmin && <ManageStudents />}
              {isDesktop && tab === 'site-settings'    && isAdmin && <ManageSiteSettings />}
              {isDesktop && tab === 'contact-messages' && isAdmin && <ContactMessages />}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>

      {/* ══ MOBILE CONTENT (no sidebar margin) ══ */}
      <div className="flex lg:hidden min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile top navbar */}
        <header
          className="fixed top-0 left-0 right-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4"
          style={{ background: 'var(--theme-grad-topbar)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/20 text-white">
              <Icon d="M4 6h16M4 12h16M4 18h16" />
            </button>
            <h1 className="truncate text-sm font-bold text-white">{PAGE_TITLES[tab]}</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationDropdown unread={unread} setUnread={setUnread} />
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => switchTab('profile')}
              className="flex items-center gap-2 rounded-xl bg-white/10 pl-1.5 pr-2 py-1 ring-1 ring-white/20"
              title="My Profile"
            >
              {user?.profileImage ? (
                <img src={fileUrl(user.profileImage)} alt="" className="h-7 w-7 rounded-lg object-cover" />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-extrabold" style={{ background: 'var(--theme-accent)', color: 'var(--theme-primary)' }}>
                  {initials}
                </div>
              )}
            </motion.button>
          </div>
        </header>
        {/* Mobile content — only rendered on mobile screens */}
        <main className="flex-1 overflow-y-auto p-4 mt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="mx-auto w-full max-w-7xl"
            >
              {!isDesktop && tab === 'overview'         && <Overview user={user} setTab={switchTab} />}
              {!isDesktop && tab === 'browse-courses'   && !isAdmin && <BrowseCourses user={user} />}
              {!isDesktop && tab === 'my-course-apps'   && !isAdmin && <MyCourseApplications />}
              {!isDesktop && tab === 'add-review'       && !isAdmin && <AddReview />}
              {!isDesktop && tab === 'announcements'    && <Announcements />}
              {!isDesktop && tab === 'profile'          && <Profile />}
              {!isDesktop && tab === 'review'           && isAdmin && <ReviewApplications />}
              {!isDesktop && tab === 'course-apps'      && isAdmin && <ManageCourseApplications />}
              {!isDesktop && tab === 'manage-ann'       && isAdmin && <ManageAnnouncements />}
              {!isDesktop && tab === 'manage-courses'   && isAdmin && <ManageCourses />}
              {!isDesktop && tab === 'manage-services'  && isAdmin && <ManageServices />}
              {!isDesktop && tab === 'student-pride'    && isAdmin && <ManageStudentPride />}
              {!isDesktop && tab === 'manage-reviews'   && isAdmin && <ManageReviews />}
              {!isDesktop && tab === 'manage-students'  && isAdmin && <ManageStudents />}
              {!isDesktop && tab === 'site-settings'    && isAdmin && <ManageSiteSettings />}
              {!isDesktop && tab === 'contact-messages' && isAdmin && <ContactMessages />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  )
}
