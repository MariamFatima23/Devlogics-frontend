import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../utils/api'

const DEFAULT_THEME = {
  primary:     '#04065c',
  secondary:   '#023e8a',
  accent:      '#48cae4',
  bgLight:     '#f0f9ff',
  bgDark:      '#04065c',
  cardBg:      '#ffffff',
  cardDark:    '#023e8a',
  textColor:   '#1e293b',
  borderColor: '#caf0f8',
  white:       '#ffffff',
  navText:     '#ffffff',
  heroFrom:    '',
  heroTo:      '',
  footerBg:    '',
}

// ── Contrast helper ──────────────────────────────────────────────────────────
// Returns '#ffffff' (white) or '#1e293b' (dark) depending on which has better
// contrast against the given background hex colour.
function getContrastText(hex) {
  try {
    const h = hex.replace('#', '')
    const r = parseInt(h.substring(0, 2), 16)
    const g = parseInt(h.substring(2, 4), 16)
    const b = parseInt(h.substring(4, 6), 16)
    // Relative luminance (WCAG formula)
    const toLinear = c => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4) }
    const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
    // White has luminance 1, dark #1e293b has luminance ~0.04
    // Use white text when background is dark (L < 0.35)
    return L < 0.35 ? '#ffffff' : '#1e293b'
  } catch {
    return '#ffffff'
  }
}

// Map theme keys → CSS custom property names
const CSS_VAR_MAP = {
  primary:     '--theme-primary',
  secondary:   '--theme-secondary',
  accent:      '--theme-accent',
  bgLight:     '--theme-bg-light',
  bgDark:      '--theme-bg-dark',
  cardBg:      '--theme-card-bg',
  cardDark:    '--theme-card-dark',
  textColor:   '--theme-text',
  borderColor: '--theme-border',
  white:       '--theme-white',
  navText:     '--theme-nav-text',
  heroFrom:    '--theme-hero-from',
  heroTo:      '--theme-hero-to',
  footerBg:    '--theme-footer-bg',
}

// Derive computed vars from base theme
function computeVars(t) {
  return {
    ...t,
    // Auto-derive gradient if section overrides not set
    heroFrom:  t.heroFrom  || t.primary,
    heroTo:    t.heroTo    || t.secondary,
    footerBg:  t.footerBg  || t.bgDark,
    white:     t.white     || '#ffffff',
    navText:   t.navText   || '#ffffff',
  }
}

function injectTheme(theme) {
  const root = document.documentElement
  const vars = computeVars(theme)
  // Always set all vars — including white/empty-string ones
  Object.entries(CSS_VAR_MAP).forEach(([key, cssVar]) => {
    const val = vars[key]
    if (val !== undefined && val !== null) {
      root.style.setProperty(cssVar, val)
    }
  })
  // Keep Tailwind-compatible vars in sync
  root.style.setProperty('--color-primary',       vars.primary)
  root.style.setProperty('--color-primary-mid',   vars.secondary)
  root.style.setProperty('--color-primary-cyan',  vars.accent)
  root.style.setProperty('--color-primary-ice',   vars.bgLight)
  root.style.setProperty('--color-primary-pale',  vars.borderColor)
  // Gradient vars (computed from resolved values)
  root.style.setProperty('--theme-grad-primary', `linear-gradient(135deg, ${vars.primary}, ${vars.secondary})`)
  root.style.setProperty('--theme-grad-hero',    `linear-gradient(135deg, ${vars.heroFrom}, ${vars.heroTo})`)
  root.style.setProperty('--theme-grad-footer',  `linear-gradient(135deg, ${vars.footerBg}, ${vars.primary})`)
  root.style.setProperty('--theme-grad-auth',    `linear-gradient(135deg, ${vars.primary} 0%, ${vars.secondary} 45%, ${vars.secondary} 80%, ${vars.accent} 100%)`)
  root.style.setProperty('--theme-grad-sidebar', `linear-gradient(180deg, ${vars.primary} 0%, ${vars.secondary} 50%, ${vars.secondary} 100%)`)
  root.style.setProperty('--theme-grad-topbar',  `linear-gradient(90deg, ${vars.primary}, ${vars.secondary})`)
}

const ThemeContext = createContext(null)

// Inject defaults immediately (before any component renders) so CSS vars are always set
injectTheme(DEFAULT_THEME)

export function ThemeProvider({ children }) {
  const [theme, setTheme]     = useState(DEFAULT_THEME)
  const [loading, setLoading] = useState(false)  // default false — vars already injected above

  // Load theme from backend on mount and override defaults
  useEffect(() => {
    api.get('/site-settings')
      .then(r => {
        const t = { ...DEFAULT_THEME, ...(r.data?.theme || {}) }
        setTheme(t)
        injectTheme(t)
      })
      .catch(() => { /* defaults already injected */ })
  }, [])

  // Update theme (called from admin panel — instant preview + save)
  const updateTheme = useCallback((updates) => {
    setTheme(prev => {
      const next = { ...prev, ...updates }
      injectTheme(next)
      return next
    })
  }, [])

  // Save theme to backend
  const saveTheme = useCallback(async (themeToSave) => {
    const data = new FormData()
    data.append('theme', JSON.stringify(themeToSave))
    await api.patch('/site-settings', data, { headers: { 'Content-Type': 'multipart/form-data' } })
    injectTheme(themeToSave)
    setTheme(themeToSave)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, saveTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
