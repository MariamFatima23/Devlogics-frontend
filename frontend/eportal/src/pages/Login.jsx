import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import AuthParticles from '../components/AuthParticles'

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
      const res = await axios.post('/api/auth/login', formData)
      login(res.data.user, res.data.token); navigate('/dashboard')
    } catch (err) { setError(err.response?.data?.message || 'Login failed.') }
    finally { setLoading(false) }
  }

  const inputCls = "w-full rounded-xl border border-[#caf0f8] bg-white/90 px-4 py-2.5 text-sm outline-none transition focus:border-[#0077b6] focus:bg-white focus:ring-2 focus:ring-[#0077b6]/15"

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #03045e 0%, #023e8a 40%, #0077b6 70%, #0096c7 100%)' }}>

      {/* Three.js particles background */}
      <AuthParticles />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="overflow-hidden rounded-3xl bg-white/10 shadow-2xl backdrop-blur-md border border-white/20">

          {/* Top accent */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #48cae4, #0077b6, #03045e)' }} />

          <div className="p-8 sm:p-10">
            {/* Logo + heading */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
                <span className="text-3xl">🎓</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
              <p className="mt-1 text-sm text-[#90e0ef]">Sign in to your dataframe E-Portal account</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/20 px-4 py-3 text-sm font-medium text-rose-200 border border-rose-400/30">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#caf0f8]">Email Address</label>
                <input type="email" name="email" placeholder="you@email.com"
                  value={formData.email} onChange={handleChange} required autoComplete="email"
                  className={inputCls} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#caf0f8]">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} name="password" placeholder="Enter your password"
                    value={formData.password} onChange={handleChange} required autoComplete="current-password"
                    className={inputCls + ' pr-10'} />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0077b6, #03045e)' }}>
                {loading ? (
                  <><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>Signing in...</>
                ) : 'Sign In →'}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20" /></div>
              <div className="relative flex justify-center"><span className="bg-transparent px-3 text-xs text-[#90e0ef]">or</span></div>
            </div>

            <p className="text-center text-sm text-[#caf0f8]">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-bold text-white hover:text-[#48cae4] transition">Register as Student</Link>
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-white/40">© {new Date().getFullYear()} dataframe E-Portal</p>
      </div>
    </div>
  )
}
