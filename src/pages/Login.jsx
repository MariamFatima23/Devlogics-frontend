import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import AuthParticles from '../components/AuthParticles'
import { motion } from 'framer-motion'
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await api.post('/auth/login', formData)
      const name = res.data.user?.name?.split(' ')[0] || 'Student'
      toast.success(`Welcome back, ${name}! 🎉`)
      login(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed.'
      setError(msg)
      toast.error(msg)
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ background: 'var(--theme-grad-auth)' }}>

      <AuthParticles />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
        className="relative z-10 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--theme-card-bg)' }}
      >
        {/* Top accent bar */}
        <div className="h-1.5 w-full" style={{ background: 'var(--theme-grad-primary)' }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8"
        >
          <div className="mb-6 flex justify-center">
            <img src="/gallery/logo1.png" alt="logo" className="h-16 w-auto object-contain" />
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-1">Welcome Back!</h2>
          <p className="text-sm text-gray-500 mb-6">Login to continue your learning journey</p>

          {error && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
              className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 font-medium">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border-2 border-gray-200 px-4 py-3 transition"
              style={{ '--tw-border-opacity': 1 }}>
              <FaEnvelope className="shrink-0" style={{ color: 'var(--theme-primary)' }} size={15}/>
              <input type="email" name="email" placeholder="Email Address"
                value={formData.email} onChange={handleChange} required
                className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-400 bg-transparent" />
            </div>

            <div className="flex items-center gap-3 rounded-xl border-2 border-gray-200 px-4 py-3 transition">
              <FaLock className="shrink-0" style={{ color: 'var(--theme-primary)' }} size={15}/>
              <input type={showPass ? 'text' : 'password'} name="password" placeholder="Password"
                value={formData.password} onChange={handleChange} required
                className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-400 bg-transparent" />
              <button type="button" onClick={() => setShowPass(v=>!v)} className="text-gray-400 hover:text-gray-600">
                {showPass ? <FaEyeSlash size={15}/> : <FaEye size={15}/>}
              </button>
            </div>

            <div className="flex justify-end -mt-1">
              <Link to="/forgot-password" className="text-xs font-semibold hover:underline"
                style={{ color: 'var(--theme-primary)' }}>
                Forgot Password?
              </Link>
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg transition disabled:opacity-60"
              style={{ background: 'var(--theme-grad-primary)' }}>
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>Signing in...
                  </span>
                : 'Login'
              }
            </motion.button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"/></div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-gray-400" style={{ background: 'var(--theme-card-bg)' }}>or</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold transition"
              style={{ color: 'var(--theme-primary)' }}>Register for free</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
