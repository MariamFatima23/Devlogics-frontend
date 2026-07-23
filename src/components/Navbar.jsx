import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api, { fileUrl } from '../utils/api'
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
  const { user, logout }   = useAuth()
  const navigate           = useNavigate()
  const { pathname }       = useLocation()
  const [unreadCount, setUnreadCount]     = useState(0)
  const [showNotif, setShowNotif]         = useState(false)
  const [notifications, setNotifications] = useState([])
  const [mobileOpen, setMobileOpen]       = useState(false)
  const [settings, setSettings]           = useState({ portalName: 'DevLogics E-Portal', logoUrl: '' })
  const notifRef = useRef(null)

  const BASE        = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
  const isDashboard = pathname === '/dashboard'

  const handleLogout = () => { logout(); navigate('/') }

  /* close notif on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* fetch settings + unread count */
  useEffect(() => {
    if (user) api.get('/notifications/unread-count').then(r => setUnreadCount(r.data.count)).catch(() => {})
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

  const logoSrc = settings.logoUrl ? fileUrl(settings.logoUrl) : '/gallery/logo1.png'

  return (
    <nav className="sticky top-0 z-50 shadow-lg border-b border-white/10" style={{ background: 'var(--theme-primary)' }}>

      {/* ── Main bar ── */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 overflow-hidden px-4 sm:h-16 sm:px-6">

        {/* Logo — strictly contained within navbar height */}
        <button
          onClick={() => scrollTo('#home')}
          className="shrink-0 flex items-center overflow-hidden"
          aria-label="Home">
          <img
            src={logoSrc}
            alt="logo"
            className="block h-8 w-auto max-h-8 max-w-[120px] object-contain sm:h-9 sm:max-h-9 lg:h-10 lg:max-h-10"
            style={{ filter: 'brightness(0) invert(1)', display: 'block' }}
          />
        </button>

        {/* Desktop nav links — lg and above */}
        <div className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {!isDashboard && !user && NAV_LINKS.map(link => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white xl:px-3">
              {link.label}
            </button>
          ))}
          {user && (
            <Link to="/dashboard"
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white">
              Dashboard
            </Link>
          )}
        </div>

        {/* Right controls */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

          {user ? (
            <>
              {/* Admin badge — only lg+ */}
              {user.role === 'admin' && (
                <span className="hidden items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold text-white ring-1 ring-white/20 lg:inline-flex">
                  <FaShieldAlt size={9} /> Admin
                </span>
              )}

              {/* Notification bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={toggleNotif}
                  className="relative flex h-8 w-8 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white sm:h-9 sm:w-9">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification dropdown — full width on mobile */}
                {showNotif && (
                  <div className="fixed left-2 right-2 top-[60px] z-50 overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-11 sm:w-80 sm:fixed-none"
                    style={{ background: 'var(--theme-grad-primary)' }}>
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                      <span className="text-sm font-bold text-white">Notifications</span>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button onClick={markAllRead}
                            className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/20 transition">
                            Mark all read
                          </button>
                        )}
                        <button onClick={() => setShowNotif(false)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition text-xs">
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto sm:max-h-72">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center text-sm text-white/50">No notifications</div>
                      ) : notifications.map(n => (
                        <div key={n._id}
                          className={`border-b border-white/10 px-4 py-3 last:border-0 ${!n.read ? 'bg-white/5' : ''}`}>
                          <div className="flex items-start gap-2.5">
                            <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.read ? 'bg-cyan-400' : 'bg-transparent'}`} />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold leading-snug text-white">{n.title}</p>
                              <p className="mt-0.5 text-xs leading-relaxed text-white/70">{n.message}</p>
                              <p className="mt-1 text-[10px] text-cyan-300">
                                {new Date(n.createdAt).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User avatar pill */}
              <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-1.5 py-1 ring-1 ring-white/10">
                {user?.profileImage ? (
                  <img src={fileUrl(user.profileImage)} alt=""
                    className="h-6 w-6 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/20 text-[11px] font-bold text-white">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="hidden max-w-[72px] truncate text-xs font-semibold text-white sm:inline lg:max-w-[90px]">
                  {user.name?.split(' ')[0]}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-white/70 transition hover:bg-rose-500/20 hover:text-rose-300 sm:h-9 sm:w-9"
                title="Logout">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </>
          ) : (
            /* Logged-out: Login button visible on sm+ */
            <Link to="/login"
              className="hidden rounded-xl px-4 py-1.5 text-sm font-bold transition hover:opacity-90 sm:inline-flex"
              style={{ background: 'var(--theme-card-bg)', color: 'var(--theme-primary)' }}>
              Login
            </Link>
          )}

          {/* Hamburger — below lg */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 text-white transition hover:bg-white/10 lg:hidden sm:h-9 sm:w-9"
            aria-label="Menu">
            {mobileOpen
              ? <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              : <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            }
          </button>
        </div>
      </div>

      {/* ── Mobile / tablet drawer ── */}
      {mobileOpen && (
        <div className="border-t border-white/10 lg:hidden" style={{ background: 'var(--theme-primary)' }}>
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">

            {/* Nav links for non-dashboard non-logged-in */}
            {!isDashboard && !user && (
              <div className="mb-3 grid grid-cols-2 gap-1 sm:grid-cols-3">
                {NAV_LINKS.map(link => (
                  <button
                    key={link.href}
                    onClick={() => { scrollTo(link.href); setMobileOpen(false) }}
                    className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white">
                    {link.label}
                  </button>
                ))}
              </div>
            )}

            {/* Auth buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-bold transition"
                  style={{ background: 'var(--theme-card-bg)', color: 'var(--theme-primary)' }}>
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-bold transition"
                  style={{ background: 'var(--theme-accent)', color: 'var(--theme-primary)' }}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
