import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function CourseApplyModal({ course, onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    phone: '', cnic: '', qualification: '', experience: '',
    whyApply: '', linkedIn: '', portfolio: '',
    paymentMethod: '', transactionId: '',
  })
  const [cvFile, setCvFile]           = useState(null)
  const [paymentProof, setPaymentProof] = useState(null)
  const [loading, setLoading]         = useState(false)
  const [done, setDone]               = useState(false)
  const [error, setError]             = useState('')

  if (!user) {
    return (
      <ModalShell onClose={onClose}>
        <div className="py-12 text-center">
          <p className="text-5xl">🔒</p>
          <p className="mt-3 font-bold text-gray-900">Please log in to apply</p>
          <button onClick={() => navigate('/login')}
            className="mt-4 rounded-xl bg-[#0077b6] px-6 py-2.5 text-sm font-bold text-white">
            Go to Login
          </button>
        </div>
      </ModalShell>
    )
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!cvFile) { setError('CV file is required.'); return }
    if (course.isPaid && !paymentProof) { setError('Payment proof is required for paid courses.'); return }
    setLoading(true)
    setError('')
    try {
      const data = new FormData()
      data.append('courseId', course._id)
      Object.entries(form).forEach(([k, v]) => data.append(k, v))
      data.append('cvFile', cvFile)
      if (paymentProof) data.append('paymentProof', paymentProof)

      await api.post('/course-applications', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-[#caf0f8] bg-[#f0f9ff] px-3 py-2.5 text-sm outline-none focus:border-[#0077b6] focus:bg-white transition'
  const labelCls = 'mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500'

  return (
    <ModalShell onClose={onClose}>
      {done ? (
        <div className="py-10 text-center">
          <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:200 }}>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl"
              style={{ background:'linear-gradient(135deg,#03045e,#0077b6)' }}>
              ✅
            </div>
          </motion.div>
          <h3 className="mt-5 text-xl font-extrabold text-gray-900">Application Submitted!</h3>
          <p className="mt-2 text-sm text-gray-500">Your application for <strong>{course.title}</strong> is under review. We'll notify you of the decision.</p>
          <button onClick={onClose}
            className="mt-6 rounded-xl bg-[#0077b6] px-8 py-2.5 text-sm font-bold text-white hover:bg-[#023e8a]">
            Done
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-5 flex items-start gap-4 rounded-2xl p-4"
            style={{ background:`linear-gradient(135deg,${course.bgFrom||'#03045e'},${course.bgTo||'#0077b6'})` }}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl">
              {course.icon || '📚'}
            </div>
            <div className="flex-1">
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                {course.type === 'internship' ? 'Internship' : 'Course'} · {course.mode}
              </span>
              <h3 className="mt-1 font-extrabold text-white">{course.title}</h3>
              <p className="text-xs text-white/70">
                {course.duration}
                {course.isPaid ? ` · PKR ${course.price}` : ' · Free'}
                {course.certified ? ' · Certified' : ''}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Full Name</label>
                <input value={user.name} disabled className={`${inputCls} opacity-60`} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input value={user.email} disabled className={`${inputCls} opacity-60`} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Phone Number *</label>
                <input value={form.phone} onChange={e=>set('phone',e.target.value)} required className={inputCls} placeholder="03XXXXXXXXX" />
              </div>
              <div>
                <label className={labelCls}>CNIC</label>
                <input value={form.cnic} onChange={e=>set('cnic',e.target.value)} className={inputCls} placeholder="XXXXX-XXXXXXX-X" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Qualification *</label>
                <input value={form.qualification} onChange={e=>set('qualification',e.target.value)} required className={inputCls} placeholder="Matric / Intermediate / Bachelor" />
              </div>
              <div>
                <label className={labelCls}>Experience</label>
                <input value={form.experience} onChange={e=>set('experience',e.target.value)} className={inputCls} placeholder="None / 1 year / etc." />
              </div>
            </div>
            <div>
              <label className={labelCls}>Why do you want to apply? *</label>
              <textarea value={form.whyApply} onChange={e=>set('whyApply',e.target.value)} required rows="3" className={inputCls} placeholder="Tell us your motivation..." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>LinkedIn Profile</label>
                <input value={form.linkedIn} onChange={e=>set('linkedIn',e.target.value)} className={inputCls} placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label className={labelCls}>Portfolio / GitHub</label>
                <input value={form.portfolio} onChange={e=>set('portfolio',e.target.value)} className={inputCls} placeholder="https://github.com/..." />
              </div>
            </div>

            {/* CV Upload */}
            <div>
              <label className={labelCls}>Upload CV (PDF/Word) *</label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-[#caf0f8] p-4 transition hover:border-[#0077b6] hover:bg-[#f0f9ff]">
                <span className="text-2xl">📄</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700">{cvFile ? cvFile.name : 'Click to select your CV'}</p>
                  <p className="text-xs text-gray-400">PDF, DOC, DOCX · max 5MB</p>
                </div>
                <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                  onChange={e => setCvFile(e.target.files[0])} />
              </label>
            </div>

            {/* Payment section — only for paid courses */}
            {course.isPaid && (
              <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-bold text-amber-800">💳 Payment Required — PKR {course.price}</p>
                {course.paymentMethod && <p className="text-xs text-amber-700">Payment via: {course.paymentMethod}</p>}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Payment Method Used</label>
                    <input value={form.paymentMethod} onChange={e=>set('paymentMethod',e.target.value)} className={inputCls} placeholder="JazzCash / Easypaisa / Bank" />
                  </div>
                  <div>
                    <label className={labelCls}>Transaction ID *</label>
                    <input value={form.transactionId} onChange={e=>set('transactionId',e.target.value)} className={inputCls} placeholder="TXN1234567" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Upload Payment Proof *</label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-amber-300 p-4 transition hover:border-amber-500 hover:bg-amber-100">
                    <span className="text-2xl">🧾</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700">{paymentProof ? paymentProof.name : 'Click to upload payment screenshot'}</p>
                      <p className="text-xs text-gray-400">PNG, JPG, PDF · max 5MB</p>
                    </div>
                    <input type="file" accept="image/*,.pdf" className="hidden"
                      onChange={e => setPaymentProof(e.target.files[0])} />
                  </label>
                </div>
              </div>
            )}

            {/* Internship info */}
            {course.type === 'internship' && (
              <div className="rounded-xl border border-[#caf0f8] bg-[#f0f9ff] p-3 text-xs text-[#0077b6]">
                <strong>Internship details:</strong> {course.duration} · Stipend: {course.stipend || 'Not specified'}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 rounded-xl border-2 border-[#caf0f8] py-3 text-sm font-bold text-gray-600 transition hover:border-gray-400">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60 transition hover:opacity-90"
                style={{ background:'linear-gradient(135deg,#0077b6,#03045e)' }}>
                {loading ? 'Submitting...' : 'Submit Application →'}
              </button>
            </div>
          </form>
        </>
      )}
    </ModalShell>
  )
}

function ModalShell({ children, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: 'rgba(3,4,94,0.7)', backdropFilter: 'blur(6px)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-500 hover:bg-gray-200">
            ✕
          </button>
          <h2 className="mb-1 text-xl font-extrabold text-gray-900">Apply for Course</h2>
          <p className="mb-5 text-xs text-gray-400">Fill in your details to submit your application</p>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
