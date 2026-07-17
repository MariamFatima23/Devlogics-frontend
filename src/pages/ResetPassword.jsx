import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import AuthParticles from '../components/AuthParticles'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const { token }             = useParams()
  const navigate              = useNavigate()
  const [password, setPass]   = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShow]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    if (password.length < 6)  { toast.error('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      await axios.post(`/api/auth/reset-password/${token}`, { password })
      setDone(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ background: 'linear-gradient(135deg,#04065c 0%,#023e8a 45%,#0077b6 80%,#0096c7 100%)' }}>

      <AuthParticles />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
        className="relative z-10 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden bg-white"
      >
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg,#04065c,#0077b6,#48cae4)' }} />

        <div className="p-8">
          <div className="mb-6 flex justify-center">
            <img src="/gallery/logo1.png" alt="logo" className="h-14 w-auto object-contain" />
          </div>

          {!done ? (
            <>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Set New Password</h2>
              <p className="text-sm text-gray-500 mb-6">Choose a strong new password for your account.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border-2 border-gray-200 px-4 py-3 transition focus-within:border-primary-blue">
                  <FaLock className="text-gray-400 shrink-0" size={15} />
                  <input
                    type={showPass ? 'text' : 'password'} required
                    value={password} onChange={e => setPass(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-400 bg-transparent"
                  />
                  <button type="button" onClick={() => setShow(v => !v)} className="text-gray-400 hover:text-gray-600">
                    {showPass ? <FaEyeSlash size={15}/> : <FaEye size={15}/>}
                  </button>
                </div>

                <div className="flex items-center gap-3 rounded-xl border-2 border-gray-200 px-4 py-3 transition focus-within:border-primary-blue">
                  <FaLock className="text-gray-400 shrink-0" size={15} />
                  <input
                    type="password" required
                    value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="Confirm new password"
                    className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-400 bg-transparent"
                  />
                </div>
                {confirm && password !== confirm && (
                  <p className="text-xs text-rose-500 -mt-2">Passwords do not match</p>
                )}

                <motion.button
                  type="submit" disabled={loading || (confirm && password !== confirm)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#0077b6,#04065c)' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Resetting...
                    </span>
                  ) : '🔐 Reset Password'}
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="text-center space-y-4 py-4"
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="flex h-16 w-16 items-center justify-center rounded-full mx-auto"
                style={{ background: 'linear-gradient(135deg,#059669,#04065c)' }}>
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </motion.div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Password Reset!</h3>
                <p className="text-sm text-gray-500 mt-1">Redirecting you to login...</p>
              </div>
            </motion.div>
          )}

          {!done && (
            <>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"/></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or</span></div>
              </div>
              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="font-bold transition" style={{ color: '#0077b6' }}>← Back to Login</Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
