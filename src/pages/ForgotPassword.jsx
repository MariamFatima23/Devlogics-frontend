import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { FaEnvelope } from 'react-icons/fa'
import AuthParticles from '../components/AuthParticles'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('/api/auth/forgot-password', { email })
      setSent(true)
      toast.success('Reset link sent! Check your email.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Try again.')
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

          {!sent ? (
            <>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Forgot Password?</h2>
              <p className="text-sm text-gray-500 mb-6">
                Enter your registered email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border-2 border-gray-200 px-4 py-3 transition focus-within:border-primary-blue">
                  <FaEnvelope className="text-gray-400 shrink-0" size={15} />
                  <input
                    type="email" required
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Your registered email"
                    className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-400 bg-transparent"
                  />
                </div>

                <motion.button
                  type="submit" disabled={loading}
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
                      Sending...
                    </span>
                  ) : 'Send Reset Link'}
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="text-center space-y-4 py-4"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto"
                style={{ background: 'linear-gradient(135deg,#04065c,#0077b6)' }}>
                <span className="text-3xl">📧</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Check Your Email</h3>
                <p className="text-sm text-gray-500 mt-2">
                  A password reset link has been sent to<br/>
                  <span className="font-bold text-primary-blue">{email}</span>
                </p>
                <p className="text-xs text-gray-400 mt-2">The link expires in 1 hour.</p>
                <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-left">
                  <p className="text-xs font-bold text-amber-700">💡 Dev mode?</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    If email is not configured, check your backend terminal — the reset link is printed there.
                  </p>
                </div>
              </div>
              <button onClick={() => { setSent(false); setEmail('') }}
                className="text-sm font-bold text-primary-blue hover:underline">
                Try a different email
              </button>
            </motion.div>
          )}

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"/></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or</span></div>
          </div>

          <p className="text-center text-sm text-gray-500">
            Remember your password?{' '}
            <Link to="/login" className="font-bold transition" style={{ color: '#0077b6' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
