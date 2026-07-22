import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { FaShieldAlt } from 'react-icons/fa'

const NAV_LINKS = [
  { label: 'About Us',       href: '#about' },
  { label: 'Courses',        href: '#courses' },
  { label: 'Certifications', href: '#howitworks' },
  { label: 'Why Choose Us',  href: '#features' },
  { label: 'Our Pride',      href: '#pride' },
  { label: 'Reviews',        href: '#reviews' },
  { label: 'Contact Us',     href: '#contact' },
]

function scrollTo(id) {
  const el = document.getElementById(id.replace('#', ''))
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const { pathname }     = useLocation()
  const [unreadCount, setUnreadCount]     = useState(0)
  const [showNotif, setShowNotif]         = useState(false)
  const [notifications, setNotifications] = useState([])
  const [mobileOpen, setMobileOpen]       = useState(false)
  const [settings, setSettings]           = useState({ portalName: 'DevLogics E-Portal', logoUrl: '' })
  const notifRef = useRef(null)

  const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

  const handleLogout = () => { logout(); navigate('/') }
  const isDashboard  = pathname === '/dashboard'

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (user) {
      api.get('/notifications/unread-count').then(r => setUnreadCount(r.data.count)).catch(() => {})
    }
    api.get('/site-settings').then(r => { if (r.data) setSettings(r.data) }).catch(() => {})
  }, [user])

  const toggleNotif = async () => {
    if (!showNotif) {
      try { const r = await api.get('/notifications'); setNotifications(r.data) } catch {}
    }
    setShowNotif(v => !v)
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read')
      setUnreadCount(0)
      setNotifications(p => p.map(n => ({ ...n, read: true })))
    } catch {}
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 transition-all duration-300"
      style={{ background: 'var(--theme-primary)' }}>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Brand — logo fixed height */}
        <button onClick={() => scrollTo('#home')} className="flex shrink-0 items-center gap-2">
          <img
            src={settings.logoUrl ? `${BASE}/uploads/${settings.logoUrl}` : '/gallery/logo1.png'}
            alt="logo"
            style={{ height: '28px', width: 'auto', maxWidth: '110px', objectFit: 'contain' }}
          />
        </button>

        {/* Desktop nav links — xl only to avoid wrap */}
        <div className="hidden items-center gap-0.5 xl:flex">
          {!isDashboard && !user && NAV_LINKS.map(link => (
            <button key={link.href} onClick={() => scrollTo(link.href)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white transition hover:text-primary-cyan lg:text-sm lg:px-3">
              {link.label}
            </button>
          ))}
          {user && (
            <Link to="/dashboard"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-white transition hover:text-primary-cyan">
              Dashboard
            </Link>
          )}
        </div>

        {/* Tablet nav links (md–xl) — fewer items, smaller text */}
        <div className="hidden items-center gap-0.5 md:flex xl:hidden">
          {!isDashboard && !user && NAV_LINKS.map(link => (
            <button key={link.href} onClick={() => scrollTo(link.href)}
              className="rounded-lg px-2 py-1 text-[11px] font-semibold text-white transition hover:text-primary-cyan whitespace-nowrap">
              {link.label}
            </button>
          ))}
          {user && (
            <Link to="/dashboard"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-white transition hover:text-primary-cyan">
              Dashboard
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === 'admin' && (
                <span className="hidden items-center gap-1 rounded-full bg-primary-cyan/20 px-2.5 py-0.5 text-xs font-bold text-primary-cyan ring-1 ring-primary-cyan/30 sm:inline-flex">
                  <FaShieldAlt size={10} /> Admin
                </span>
              )}

              {/* Notification bell */}
              <div className="relative" ref={notifRef}>
                <button onClick={toggleNotif}
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotif && (
                  <div className="absolute right-0 top-11 w-80 max-w-[92vw] overflow-hidden rounded-2xl border border-primary-mid/50 shadow-2xl"
                    style={{ background: 'var(--theme-grad-primary)' }}>
                    <div className="flex items-center justify-between border-b border-primary-mid px-4 py-3">
                      <span className="text-sm font-bold text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead}
                          className="rounded-lg bg-white/10 px-2 py-1 text-xs font-semibold text-white hover:bg-white/20">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center text-sm text-white/50">No notifications</div>
                      ) : notifications.map(n => (
                        <div key={n._id}
                          className={`border-b border-primary-mid/50 px-4 py-3 last:border-0 ${!n.read ? 'bg-primary-mid/30' : ''}`}>
                          <div className="flex items-start gap-2">
                            <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.read ? 'bg-primary-cyan' : 'bg-transparent'}`} />
                            <div>
                              <p className="text-sm font-semibold text-white">{n.title}</p>
                              <p className="mt-0.5 text-xs text-white/70">{n.message}</p>
                              <p className="mt-1 text-[10px] text-primary-cyan">
                                {new Date(n.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-white/20" />

              {/* User pill */}
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-2 py-1.5 ring-1 ring-white/10 sm:px-3">
                {user?.profileImage ? (
                  <img src={`${BASE}/uploads/${user.profileImage}`} alt=""
                    className="h-6 w-6 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-blue text-[10px] font-bold text-white">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="hidden max-w-[80px] truncate text-sm font-semibold text-white sm:inline">{user.name}</span>
              </div>

              <button onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold text-white/70 transition hover:bg-rose-500/15 hover:text-rose-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="hidden rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 sm:inline-flex lg:px-4 lg:py-2 lg:text-sm"
                style={{ background: 'var(--theme-card-bg)', color: 'var(--theme-primary)' }}>
                Login
              </Link>
              <Link to="/register"
                className="rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 lg:px-4 lg:py-2 lg:text-sm"
                style={{ background: 'var(--theme-accent)', color: 'var(--theme-primary)' }}>
                Join Free
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(v => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 text-white md:hidden">
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 px-4 py-3 md:hidden" style={{ background: 'var(--theme-primary)' }}>
          <div className="flex flex-col gap-1">
            {!isDashboard && !user && NAV_LINKS.map(link => (
              <button key={link.href} onClick={() => { scrollTo(link.href); setMobileOpen(false) }}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white hover:text-primary-cyan">
                {link.label}
              </button>
            ))}
            {user ? (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                className="mt-1 w-full rounded-xl px-4 py-2.5 text-center text-sm font-bold text-primary transition hover:opacity-90"
                style={{ background: 'var(--theme-accent)' }}>
                Dashboard
              </Link>
            ) : (
              <div className="mt-1 flex gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: 'var(--theme-card-bg)', color: 'var(--theme-primary)' }}>
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: 'var(--theme-accent)', color: 'var(--theme-primary)' }}>
                  Join Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
