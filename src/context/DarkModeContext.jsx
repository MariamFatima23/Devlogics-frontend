import { createContext, useContext, useEffect, useState } from 'react'

const DarkModeContext = createContext(null)

export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('darkMode') === 'true' } catch { return false }
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.setAttribute('data-dark', 'true')
      // Override light surface vars for dark mode
      root.style.setProperty('--theme-card-bg',   '#1e2433')
      root.style.setProperty('--theme-bg-light',  '#111827')
      root.style.setProperty('--theme-text',       '#f1f5f9')
      root.style.setProperty('--theme-border',     '#334155')
      root.style.setProperty('--color-primary-ice','#111827')
      root.style.setProperty('--color-primary-pale','#334155')
    } else {
      root.removeAttribute('data-dark')
      // Restore light mode defaults (ThemeContext will re-inject its values)
      root.style.removeProperty('--theme-card-bg')
      root.style.removeProperty('--theme-bg-light')
      root.style.removeProperty('--theme-text')
      root.style.removeProperty('--theme-border')
      root.style.removeProperty('--color-primary-ice')
      root.style.removeProperty('--color-primary-pale')
    }
    localStorage.setItem('darkMode', dark)
  }, [dark])

  const toggle = () => setDark(v => !v)

  return (
    <DarkModeContext.Provider value={{ dark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export const useDarkMode = () => useContext(DarkModeContext)
