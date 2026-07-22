import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import AuthParticles from '../components/AuthParticles'
import { motion } from 'framer-motion'
import { FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function Register() {
  const [formData, setFormData] = useState({ name:'', email:'', password:'', rollNumber:'', department:'', semester:'', phone:'' })
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const inputCls = "w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 bg-white"

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) {
      const msg = 'Please fill all required fields'
      setError(msg); toast.error(msg); return
    }
    if (formData.password.length < 6) {
      const msg = 'Password must be at least 6 characters'
      setError(msg); toast.error(msg); return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/register', formData)
      toast.success('Account created successfully! 🎉')
      login(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      setError(msg); toast.error(msg); setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
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

        <div className="p-8">
          <div className="mb-6 flex justify-center">
            <img src="/gallery/logo1.png" alt="logo" className="h-16 w-auto object-contain" />
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-1">Create Account</h2>
          <p className="text-sm text-gray-500 mb-5">Join DevLogics E-Portal — it's free</p>

          {error && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
              className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 font-medium">
              {error}
            </motion.div>
          )}

          <motion.form
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.3 }}
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <input name="name" type="text" placeholder="Full Name"
              value={formData.name} onChange={handleChange} required className={inputCls} />

            <input name="email" type="email" placeholder="Email Address"
              value={formData.email} onChange={handleChange} required className={inputCls} />

            {/* Password with show/hide */}
            <div className="relative">
              <input
                name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Password (min 6 chars)"
                value={formData.password}
                onChange={handleChange}
                required
                className={`${inputCls} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                tabIndex={-1}
              >
                {showPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>

            <input name="phone" type="tel" placeholder="Phone Number"
              value={formData.phone} onChange={handleChange} required className={inputCls} />

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
              className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'var(--theme-grad-primary)' }}
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>Creating...
                </>
              ) : (
                <><FaUserPlus size={13}/> Create Account</>
              )}
            </motion.button>
          </motion.form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"/></div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-gray-400" style={{ background: 'var(--theme-card-bg)' }}>or</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold transition"
              style={{ color: 'var(--theme-primary)' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
