import { Routes, Route, Navigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useState, useCallback } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { InitialLoader, RouteLoader } from './components/PageLoader'

function AppInner() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [initialDone, setInitialDone] = useState(false)

  const handleInitialDone = useCallback(() => setInitialDone(true), [])

  const showNavbar = pathname !== '/dashboard' && pathname !== '/login' && pathname !== '/register' && !pathname.startsWith('/forgot-password') && !pathname.startsWith('/reset-password')

  return (
    <>
      <RouteLoader />
      {!initialDone && <InitialLoader onDone={handleInitialDone} />}
      <div className="app">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            },
            success: {
              style: { background: '#04065c', color: '#ffffff', border: '1px solid #0077b6' },
              iconTheme: { primary: '#48cae4', secondary: '#04065c' },
            },
            error: {
              style: { background: '#fff0f0', color: '#dc2626', border: '1px solid #fca5a5' },
              iconTheme: { primary: '#dc2626', secondary: '#fff0f0' },
            },
            loading: {
              style: { background: '#04065c', color: '#ffffff', border: '1px solid #0077b6' },
              iconTheme: { primary: '#48cae4', secondary: '#04065c' },
            },
          }}
        />
        {showNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
          <Route path="/reset-password/:token" element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}
