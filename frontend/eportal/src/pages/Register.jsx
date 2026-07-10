import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import AuthParticles from '../components/AuthParticles'

const departments = ['Computer Science','Software Engineering','Electrical Engineering','Mechanical Engineering','Business Administration','Mathematics','Physics','Chemistry','English','Other']
const semesters   = ['1st','2nd','3rd','4th','5th','6th','7th','8th']

const inputCls = "w-full rounded-xl border border-[#caf0f8] bg-white/90 px-3 py-2.5 text-sm outline-none transition focus:border-[#0077b6] focus:bg-white focus:ring-2 focus:ring-[#0077b6]/15"

export default function Register() {
  const [step, setStep]       = useState(1)
  const [formData, setFormData] = useState({ name:'', email:'', password:'', rollNumber:'', department:'', semester:'', phone:'' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError('') }

  const handleNext = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) { setError('Please fill all fields'); return }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setError(''); setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await axios.post('/api/auth/register', formData)
      login(res.data.user, res.data.token); navigate('/dashboard')
    } catch (err) { setError(err.response?.data?.message || 'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden py-10"
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
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
                <span className="text-3xl">🚀</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Create Account</h2>
              <p className="mt-1 text-sm text-[#90e0ef]">Join dataframe E-Portal — it's free</p>
            </div>

            {/* Step indicator */}
            <div className="mb-6 flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold border-2 ${step === 1 ? 'border-[#48cae4] bg-[#48cae4] text-[#03045e]' : 'border-emerald-400 bg-emerald-400 text-white'}`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <div className={`h-1 flex-1 rounded-full transition-all ${step > 1 ? 'bg-[#48cae4]' : 'bg-white/20'}`} />
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold border-2 ${step === 2 ? 'border-[#48cae4] bg-[#48cae4] text-[#03045e]' : 'border-white/30 bg-white/10 text-white'}`}>
                2
              </div>
              <span className="text-xs text-[#90e0ef]">{step === 1 ? 'Account Info' : 'Student Info'}</span>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/20 px-4 py-3 text-sm font-medium text-rose-200 border border-rose-400/30">
                ⚠️ {error}
              </div>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <form onSubmit={handleNext} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#caf0f8]">Full Name</label>
                  <input name="name" type="text" placeholder="Your full name" value={formData.name} onChange={handleChange} required className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#caf0f8]">Email Address</label>
                  <input name="email" type="email" placeholder="you@email.com" value={formData.email} onChange={handleChange} required className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#caf0f8]">Password</label>
                  <input name="password" type="password" placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} required className={inputCls} />
                </div>
                <button type="submit"
                  className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #0077b6, #03045e)' }}>
                  Next Step →
                </button>
              </form>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#caf0f8]">Roll Number</label>
                  <input name="rollNumber" type="text" placeholder="e.g. CS-2021-001" value={formData.rollNumber} onChange={handleChange} required className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#caf0f8]">Department</label>
                    <select name="department" value={formData.department} onChange={handleChange} required className={inputCls}>
                      <option value="">Select</option>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#caf0f8]">Semester</label>
                    <select name="semester" value={formData.semester} onChange={handleChange} required className={inputCls}>
                      <option value="">Select</option>
                      {semesters.map(s => <option key={s} value={s}>{s} Semester</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#caf0f8]">Phone Number</label>
                  <input name="phone" type="tel" placeholder="03XX-XXXXXXX" value={formData.phone} onChange={handleChange} className={inputCls} />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setStep(1)}
                    className="w-1/3 rounded-xl border border-white/30 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition">
                    ← Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-60 transition hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #0077b6, #03045e)' }}>
                    {loading ? 'Creating...' : 'Create Account 🎓'}
                  </button>
                </div>
              </form>
            )}

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"/></div>
              <div className="relative flex justify-center"><span className="bg-transparent px-3 text-xs text-[#90e0ef]">or</span></div>
            </div>
            <p className="text-center text-sm text-[#caf0f8]">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-white hover:text-[#48cae4] transition">Sign in</Link>
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-white/40">© {new Date().getFullYear()} dataframe E-Portal</p>
      </div>
    </div>
  )
}
