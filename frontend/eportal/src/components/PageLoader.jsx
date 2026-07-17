import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

// ── Full-screen initial loader (shown on first paint) ──────────────────────
export function InitialLoader({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="initial-loader">
      {/* Glowing ring */}
      <div className="il-ring">
        <div className="il-ring-inner" />
      </div>

      {/* Portal name */}
      <p className="il-title">DevLogics E-Portal</p>

      {/* Animated dots */}
      <div className="il-dots">
        <span /><span /><span />
      </div>
    </div>
  )
}

// ── Slim top progress bar shown on every route change ─────────────────────
export function RouteLoader() {
  const location = useLocation()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible]   = useState(false)

  useEffect(() => {
    // Reset & animate forward
    setProgress(0)
    setVisible(true)

    const t1 = setTimeout(() => setProgress(40),  50)
    const t2 = setTimeout(() => setProgress(70),  200)
    const t3 = setTimeout(() => setProgress(90),  450)
    const t4 = setTimeout(() => setProgress(100), 700)
    const t5 = setTimeout(() => setVisible(false), 950)

    return () => [t1,t2,t3,t4,t5].forEach(clearTimeout)
  }, [location.pathname])

  if (!visible) return null

  return (
    <div
      className="route-loader-bar"
      style={{ width: `${progress}%` }}
    />
  )
}
