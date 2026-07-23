import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

// Check if profile has required fields filled
function getProfileIssues(user) {
  const missing = []
  if (!user?.name)          missing.push('Full Name')
  if (!user?.phone)         missing.push('Phone Number')
  if (!user?.cnic)          missing.push('CNIC')
  if (!user?.qualification) missing.push('Qualification')
  if (!user?.cv)            missing.push('CV (upload in Profile)')
  return missing
}

const inputCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition'
const labelCls = 'mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500'

export default function CourseApplyModal({ course, onClose, onGoToProfile }) {
  const { user } = useAuth()
  const navigate  = useNavigate()

  const profileIssues = user ? getProfileIssues(user) : []
  const profileComplete = profileIssues.length === 0

  // steps: 'profile-check' | 'form' | 'payment' | 'agreement' | 'done'
  const [step, setStep] = useState(() => {
    if (!user)             return 'form'
    if (!profileComplete)  return 'profile-check'
    return 'form'
  })

  const [form, setForm] = useState({
    experience: '', whyApply: '', linkedIn: '', portfolio: '',
    paymentMethod: '', transactionId: '',
  })
  const [cvFile,       setCvFile]       = useState(null)
  const [paymentProof, setPaymentProof] = useState(null)
  const [paymentPlan,  setPaymentPlan]  = useState('full')  // 'full' | 'installment'
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  // Signature canvas
  const canvasRef      = useRef(null)
  const [drawing,      setDrawing]      = useState(false)
  const [hasSig,       setHasSig]       = useState(false)
  const [agreed,       setAgreed]       = useState(false)
  // Security deposit
  const [securityType,  setSecurityType]  = useState('')   // 'fee' | 'document'
  const [securityProof, setSecurityProof] = useState(null) // file upload

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // ── Canvas drawing helpers ──
  const getPos = (e, canvas) => {
    const r = canvas.getBoundingClientRect()
    const src = e.touches ? e.touches[0] : e
    return { x: src.clientX - r.left, y: src.clientY - r.top }
  }
  const startDraw  = (e) => { e.preventDefault(); setDrawing(true); const c = canvasRef.current; const ctx = c.getContext('2d'); const p = getPos(e,c); ctx.beginPath(); ctx.moveTo(p.x, p.y) }
  const draw       = (e) => { e.preventDefault(); if (!drawing) return; const c = canvasRef.current; const ctx = c.getContext('2d'); const p = getPos(e,c); ctx.lineTo(p.x,p.y); ctx.strokeStyle='#04065c'; ctx.lineWidth=2.5; ctx.lineCap='round'; ctx.stroke(); setHasSig(true) }
  const endDraw    = (e) => { e.preventDefault(); setDrawing(false) }
  const clearSig   = () => { const c = canvasRef.current; c.getContext('2d').clearRect(0,0,c.width,c.height); setHasSig(false) }

  // ── Submit ──
  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      const data = new FormData()
      data.append('courseId', course._id)
      data.append('phone',         user.phone)
      data.append('cnic',          user.cnic)
      data.append('qualification', user.qualification)
      data.append('experience',    form.experience)
      data.append('whyApply',      form.whyApply)
      data.append('linkedIn',      form.linkedIn)
      data.append('portfolio',     form.portfolio)
      data.append('paymentMethod', form.paymentMethod)
      data.append('transactionId', form.transactionId)
      data.append('paymentPlan',   paymentPlan)

      if (cvFile)           data.append('cvFile', cvFile)
      else if (user?.cv)    data.append('useProfileCv', 'true')
      if (paymentProof)     data.append('paymentProof', paymentProof)

      // Internship: save signature as PNG blob + security
      if (course.type === 'internship') {
        data.append('agreementSigned', 'true')
        data.append('securityType', securityType)
        if (securityProof) data.append('securityProof', securityProof)
        await new Promise(resolve => {
          canvasRef.current.toBlob(blob => {
            data.append('signatureFile', blob, 'signature.png')
            resolve()
          }, 'image/png')
        })
      }

      await api.post('/course-applications', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setStep('done')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally { setLoading(false) }
  }

  const handleFormNext = (e) => {
    e.preventDefault(); setError('')
    if (!form.whyApply.trim()) { setError('Please tell us why you want to apply.'); return }
    if (!cvFile && !user?.cv)  { setError('CV is required. Upload in your Profile first.'); return }
    if (course.isPaid)          setStep('payment')
    else if (course.type === 'internship') setStep('agreement')
    else handleSubmit()
  }

  const handlePaymentNext = () => {
    setError('')
    if (!form.paymentMethod.trim()) { setError('Payment method is required.'); return }
    if (!form.transactionId.trim()) { setError('Transaction ID is required.'); return }
    if (!paymentProof)               { setError('Payment screenshot is required.'); return }
    if (course.type === 'internship') setStep('agreement')
    else handleSubmit()
  }

  const handleAgreementSubmit = () => {
    setError('')
    if (!agreed)       { setError('You must agree to the terms.'); return }
    if (!hasSig)       { setError('Please draw your signature.'); return }
    if (!securityType) { setError('Please choose a security option.'); return }
    if (!securityProof){ setError('Please upload the required security document/screenshot.'); return }
    handleSubmit()
  }

  if (!user) return (
    <ModalShell onClose={onClose}>
      <div className="py-12 text-center">
        <p className="text-5xl">🔒</p>
        <p className="mt-3 font-bold text-gray-900">Please log in to apply</p>
        <button onClick={() => navigate('/login')} className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white">Go to Login</button>
      </div>
    </ModalShell>
  )

  // ── Step: Profile Incomplete ──
  if (step === 'profile-check') return (
    <ModalShell onClose={onClose} title="Complete Your Profile First" subtitle="We need a few details before you can apply">
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 mb-5">
        <p className="text-sm font-bold text-amber-800 mb-3">⚠️ The following fields are missing from your profile:</p>
        <ul className="space-y-1.5">
          {profileIssues.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0"/>
              {f}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-sm text-gray-500 mb-5">Please complete your profile with all required details including your CV, then come back to apply.</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-bold text-gray-600">Cancel</button>
        <button onClick={() => { onClose(); if (onGoToProfile) onGoToProfile() }}
          className="flex-1 rounded-xl py-3 text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#0077b6,#04065c)' }}>
          Go to My Profile →
        </button>
      </div>
    </ModalShell>
  )

  // ── Step: Done ──
  if (step === 'done') return (
    <ModalShell onClose={onClose}>
      <div className="py-10 text-center">
        <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:200 }}>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl"
            style={{ background:'linear-gradient(135deg,#04065c,#0077b6)' }}>✅</div>
        </motion.div>
        <h3 className="mt-5 text-xl font-extrabold text-gray-900">Application Submitted!</h3>
        <p className="mt-2 text-sm text-gray-500">Your application for <strong>{course.title}</strong> is under review. We'll notify you of the decision.</p>
        <button onClick={onClose} className="mt-6 rounded-xl px-8 py-2.5 text-sm font-bold text-white" style={{ background:'linear-gradient(135deg,#0077b6,#04065c)' }}>Done</button>
      </div>
    </ModalShell>
  )

  // ── Step: Payment ──
  if (step === 'payment') {
    const installmentAmt = course.allowsInstallments
      ? Math.ceil(course.price / (course.installmentCount || 2))
      : 0

    return (
    <ModalShell onClose={onClose} title="💳 Payment" subtitle="Choose your payment plan and complete the first payment">

      {/* Fee banner */}
      <div className="mb-5 rounded-2xl p-4 flex items-center justify-between"
        style={{ background:`linear-gradient(135deg,${course.bgFrom||'#04065c'},${course.bgTo||'#0077b6'})` }}>
        <div>
          <p className="text-xs font-bold uppercase text-white/60 mb-0.5">Total Course Fee</p>
          <p className="text-3xl font-extrabold text-white">PKR {course.price?.toLocaleString()}</p>
          <p className="text-xs text-white/60 mt-0.5">{course.title}</p>
        </div>
        {course.allowsInstallments && (
          <div className="text-right">
            <p className="text-[10px] font-bold text-white/50 uppercase">Or pay in</p>
            <p className="text-lg font-extrabold text-cyan-300">{course.installmentCount || 2} installments</p>
            <p className="text-xs text-white/60">PKR {installmentAmt?.toLocaleString()} each</p>
          </div>
        )}
      </div>

      {/* Payment plan choice */}
      {course.allowsInstallments && (
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Choose Payment Plan</p>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex cursor-pointer flex-col gap-1 rounded-2xl border-2 p-4 transition ${paymentPlan==='full' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
              <div className="flex items-center gap-2">
                <input type="radio" name="paymentPlan" value="full" checked={paymentPlan==='full'} onChange={() => setPaymentPlan('full')} className="accent-blue-600"/>
                <span className="text-sm font-extrabold text-gray-800">Full Payment</span>
              </div>
              <p className="text-xs text-gray-500 pl-5">Pay PKR {course.price?.toLocaleString()} now. No installments.</p>
            </label>
            <label className={`flex cursor-pointer flex-col gap-1 rounded-2xl border-2 p-4 transition ${paymentPlan==='installment' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
              <div className="flex items-center gap-2">
                <input type="radio" name="paymentPlan" value="installment" checked={paymentPlan==='installment'} onChange={() => setPaymentPlan('installment')} className="accent-blue-600"/>
                <span className="text-sm font-extrabold text-gray-800">Installments</span>
              </div>
              <p className="text-xs text-gray-500 pl-5">{course.installmentCount || 2}× PKR {installmentAmt?.toLocaleString()} monthly. Pay first now.</p>
            </label>
          </div>
        </div>
      )}

      {paymentPlan === 'installment' && (
        <div className="mb-4 rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-xs text-cyan-800">
          📅 First installment of <strong>PKR {installmentAmt?.toLocaleString()}</strong> is due now. Remaining installments due monthly.
        </div>
      )}

      {/* Payment methods */}
      <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-3">
        <p className="text-xs font-extrabold text-amber-800 uppercase">How to Pay</p>

        {/* JazzCash */}
        {course.jazzcashNumber && (
          <div className="flex items-center justify-between rounded-xl bg-white border border-amber-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl font-extrabold text-white text-xs"
                style={{ background: 'linear-gradient(135deg,#e91e8c,#9c27b0)' }}>JC</div>
              <div>
                <p className="text-sm font-extrabold text-gray-800">JazzCash</p>
                <p className="text-xs text-gray-500">Send to: <strong className="text-gray-800">{course.jazzcashNumber}</strong></p>
              </div>
            </div>
            <button type="button" onClick={() => navigator.clipboard?.writeText(course.jazzcashNumber)}
              className="rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700 hover:bg-amber-200">
              Copy
            </button>
          </div>
        )}

        {/* Other methods */}
        {course.paymentMethod && (
          <div className="rounded-xl bg-white border border-amber-200 px-4 py-2.5">
            <p className="text-xs font-bold text-amber-700 mb-0.5">Other Methods Accepted</p>
            <p className="text-sm text-gray-700">{course.paymentMethod}</p>
          </div>
        )}

        <p className="text-[10px] text-amber-600">
          Send exactly PKR {paymentPlan === 'installment' ? installmentAmt?.toLocaleString() : course.price?.toLocaleString()}, then fill in details below.
        </p>
      </div>

      {error && <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>}

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Payment Method Used *</label>
            <input value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}
              className={inputCls} placeholder="JazzCash / Bank Transfer"/>
          </div>
          <div>
            <label className={labelCls}>Transaction ID *</label>
            <input value={form.transactionId} onChange={e => set('transactionId', e.target.value)}
              className={inputCls} placeholder="TXN1234567"/>
          </div>
        </div>

        <div>
          <label className={labelCls}>Payment Screenshot *</label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-amber-300 p-4 hover:border-amber-500 hover:bg-amber-50 transition">
            <span className="text-2xl">🧾</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700">{paymentProof ? paymentProof.name : 'Upload payment screenshot'}</p>
              <p className="text-xs text-gray-400">PNG, JPG, PDF · max 5MB</p>
            </div>
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => setPaymentProof(e.target.files[0])}/>
          </label>
          {paymentProof && <p className="mt-1 text-xs text-green-600 font-medium">✓ {paymentProof.name}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={() => { setStep('form'); setError('') }}
            className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-bold text-gray-600">← Back</button>
          <button onClick={handlePaymentNext} disabled={loading}
            className="flex-1 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#d97706,#92400e)' }}>
            {course.type === 'internship' ? 'Next: Agreement →' : (loading ? 'Submitting...' : '✅ Confirm & Submit')}
          </button>
        </div>
      </div>
    </ModalShell>
  )}

  // ── Step: Agreement + Signature (internship) ──
  if (step === 'agreement') return (
    <ModalShell onClose={onClose} title="📋 Internship Agreement" subtitle="Read carefully, complete security, then sign">

      {/* Agreement text */}
      <div className="mb-5 max-h-56 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 space-y-2.5">
        <p className="font-extrabold text-gray-900 text-base">Internship Agreement — DevLogics Skill Center</p>
        <p>This Agreement is entered into between <strong>DevLogics Skill Center</strong> ("Organization") and <strong>{user.name}</strong> ("Intern") effective upon acceptance.</p>
        <p><strong>1. Duration:</strong> The internship period is <strong>{course.duration || 'as specified'}</strong>, starting on the date communicated by the Organization.</p>
        <p><strong>2. Responsibilities:</strong> The Intern agrees to complete all assigned tasks diligently, maintain professional conduct, and follow all Organization policies.</p>
        <p><strong>3. Confidentiality:</strong> The Intern shall keep all proprietary information, client data, and internal processes strictly confidential during and after the internship.</p>
        <p><strong>4. Attendance:</strong> Regular attendance is mandatory as per the communicated schedule. Leaves must be notified at least 24 hours in advance.</p>
        <p><strong>5. Stipend:</strong> {course.stipend ? `The Intern will receive ${course.stipend} per month.` : 'This is an unpaid internship.'}</p>
        <p><strong>6. Intellectual Property:</strong> All work produced during the internship is the exclusive property of the Organization.</p>
        <p><strong>7. Termination:</strong> Either party may terminate with 7 days' written notice. The Organization may terminate immediately for misconduct.</p>
        <p><strong>8. Certification:</strong> {course.certified ? 'An official certificate will be awarded upon successful completion.' : 'Certification is not guaranteed.'}</p>

        {/* Fine / Penalty clause — highlighted */}
        <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 mt-2">
          <p className="font-extrabold text-rose-700 mb-1">⚠️ 9. Penalty Clause (Security)</p>
          <p className="text-rose-700 text-xs leading-relaxed">
            If the Intern violates any term of this Agreement — including unauthorized absence, breach of confidentiality, misconduct, or early exit without notice — a <strong>penalty of PKR 5,000</strong> shall be levied as per the security arrangement agreed upon at the time of application. This amount shall be deducted from the security deposit (if fee was paid) or claimed against the submitted guarantee document.
          </p>
        </div>

        <p className="text-[10px] text-gray-400 pt-1">By signing below and providing security, the Intern confirms they have read, understood, and agree to all terms of this Agreement.</p>
      </div>

      {/* I agree checkbox */}
      <label className="mb-5 flex cursor-pointer items-start gap-3">
        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-blue-600"/>
        <span className="text-sm text-gray-700 leading-snug">
          I have read and fully agree to all terms of this Internship Agreement, including the <strong className="text-rose-600">PKR 5,000 penalty clause</strong>.
        </span>
      </label>

      {/* Security section */}
      <div className="mb-5 rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 space-y-4">
        <div>
          <p className="text-sm font-extrabold text-blue-900 mb-0.5">🔒 Security Arrangement</p>
          <p className="text-xs text-blue-600">Choose one of the following security options to proceed:</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Option A — Security Fee */}
          <label className={`flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-4 transition ${securityType==='fee' ? 'border-blue-500 bg-white shadow-md' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
            <div className="flex items-center gap-2">
              <input type="radio" name="securityType" value="fee" checked={securityType==='fee'} onChange={() => { setSecurityType('fee'); setSecurityProof(null) }} className="accent-blue-600"/>
              <span className="text-sm font-bold text-gray-800">💳 Pay Security Fee</span>
            </div>
            <p className="text-xs text-gray-500 pl-5">Pay PKR 5,000 security deposit and upload the payment screenshot.</p>
            {securityType === 'fee' && (
              <div className="mt-1">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-3 hover:border-amber-500 transition">
                  <span className="text-xl">🧾</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-700">{securityProof ? securityProof.name : 'Upload payment screenshot'}</p>
                    <p className="text-[10px] text-gray-400">PNG, JPG, PDF</p>
                  </div>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => setSecurityProof(e.target.files[0])}/>
                </label>
                {securityProof && <p className="mt-1 text-[10px] text-green-600 font-medium">✓ {securityProof.name}</p>}
              </div>
            )}
          </label>

          {/* Option B — Original Document */}
          <label className={`flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-4 transition ${securityType==='document' ? 'border-blue-500 bg-white shadow-md' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
            <div className="flex items-center gap-2">
              <input type="radio" name="securityType" value="document" checked={securityType==='document'} onChange={() => { setSecurityType('document'); setSecurityProof(null) }} className="accent-blue-600"/>
              <span className="text-sm font-bold text-gray-800">📑 Submit Guarantee Document</span>
            </div>
            <p className="text-xs text-gray-500 pl-5">Upload a scanned copy of an original guarantee document (e.g. CNIC, institution letter).</p>
            {securityType === 'document' && (
              <div className="mt-1">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 p-3 hover:border-blue-500 transition">
                  <span className="text-xl">📄</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-700">{securityProof ? securityProof.name : 'Upload document scan'}</p>
                    <p className="text-[10px] text-gray-400">PNG, JPG, PDF</p>
                  </div>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => setSecurityProof(e.target.files[0])}/>
                </label>
                {securityProof && <p className="mt-1 text-[10px] text-green-600 font-medium">✓ {securityProof.name}</p>}
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Signature */}
      <div className="mb-5">
        <label className={labelCls}>Draw Your Signature *</label>
        <div className="relative rounded-xl border-2 border-gray-200 bg-white overflow-hidden">
          <canvas ref={canvasRef} width={560} height={130}
            className="w-full touch-none cursor-crosshair"
            style={{ background: hasSig ? '#fff' : 'repeating-linear-gradient(90deg,#f8fafc 0px,#f8fafc 19px,#e2e8f0 20px)' }}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
          />
          {!hasSig && <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-300 font-medium">Sign here with your mouse or finger</p>}
        </div>
        {hasSig && <button type="button" onClick={clearSig} className="mt-1.5 text-xs text-rose-500 hover:text-rose-700 font-medium">✕ Clear</button>}
      </div>

      {error && <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>}

      <div className="flex gap-3">
        <button onClick={() => { setStep(course.isPaid ? 'payment' : 'form'); setError('') }}
          className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-bold text-gray-600">← Back</button>
        <button onClick={handleAgreementSubmit}
          disabled={loading || !agreed || !hasSig || !securityType || !securityProof}
          className="flex-1 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#0077b6,#04065c)' }}>
          {loading ? 'Submitting...' : '✅ Sign & Submit Application'}
        </button>
      </div>
    </ModalShell>
  )

  // ── Step: Main Application Form ──
  return (
    <ModalShell onClose={onClose}>
      {/* Course header */}
      <div className="mb-4 flex items-start gap-4 rounded-2xl p-4"
        style={{ background:`linear-gradient(135deg,${course.bgFrom||'#04065c'},${course.bgTo||'#0077b6'})` }}>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl">{course.icon||'📚'}</div>
        <div className="flex-1">
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            {course.type==='internship'?'Internship':'Course'} · {course.mode}
          </span>
          <h3 className="mt-1 font-extrabold text-white">{course.title}</h3>
          <p className="text-xs text-white/70">{course.duration}{course.isPaid?` · PKR ${course.price?.toLocaleString()}`:'· Free'}{course.certified?' · Certified':''}</p>
        </div>
        {course.isPaid && (
          <div className="shrink-0 rounded-xl bg-amber-400 px-3 py-1.5 text-center">
            <p className="text-[10px] font-bold text-amber-900">PAID</p>
            <p className="text-sm font-extrabold text-amber-900">PKR {course.price?.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Pre-filled profile summary */}
      <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-xs font-bold text-blue-800 mb-2 uppercase">Your Details (from Profile)</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-blue-700">
          <span>👤 {user.name}</span>
          <span>📧 {user.email}</span>
          <span>📞 {user.phone}</span>
          <span>🪪 {user.cnic}</span>
          <span>🎓 {user.qualification}</span>
          {user.department && <span>🏫 {user.department}</span>}
        </div>
        {user.cv && (
          <a href={user.cv.startsWith('http') ? user.cv : `${BASE}/uploads/${user.cv}`} target="_blank" rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
            📄 View saved CV
          </a>
        )}
      </div>

      {error && <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>}

      <form onSubmit={handleFormNext} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Experience</label>
            <input value={form.experience} onChange={e=>set('experience',e.target.value)} className={inputCls} placeholder="None / 1 year / etc."/>
          </div>
          <div>
            <label className={labelCls}>LinkedIn</label>
            <input value={form.linkedIn} onChange={e=>set('linkedIn',e.target.value)} className={inputCls} placeholder="https://linkedin.com/in/..."/>
          </div>
        </div>
        <div>
          <label className={labelCls}>Portfolio / GitHub</label>
          <input value={form.portfolio} onChange={e=>set('portfolio',e.target.value)} className={inputCls} placeholder="https://github.com/..."/>
        </div>
        <div>
          <label className={labelCls}>Why do you want to apply? *</label>
          <textarea value={form.whyApply} onChange={e=>set('whyApply',e.target.value)} required rows="3" className={inputCls} placeholder="Tell us your motivation..."/>
        </div>

        {/* CV override */}
        <div>
          <label className={labelCls}>CV {user.cv ? '(using saved — optional replace)' : '*'}</label>
          {user.cv && !cvFile ? (
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3">
              <span className="text-xl">📄</span>
              <p className="flex-1 text-sm font-semibold text-green-700">Using CV from Profile</p>
              <label className="cursor-pointer rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                Replace <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e=>setCvFile(e.target.files[0])}/>
              </label>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-blue-400 hover:bg-blue-50 transition">
              <span className="text-2xl">📄</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700">{cvFile ? cvFile.name : 'Click to upload your CV'}</p>
                <p className="text-xs text-gray-400">PDF, DOC, DOCX · max 5MB</p>
              </div>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e=>setCvFile(e.target.files[0])}/>
            </label>
          )}
          {cvFile && <p className="mt-1 text-xs text-green-600">✓ {cvFile.name} <button type="button" onClick={()=>setCvFile(null)} className="ml-2 text-rose-500">Remove</button></p>}
        </div>

        {/* Step hint */}
        {course.isPaid && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">💳 Next: Payment of <strong>PKR {course.price?.toLocaleString()}</strong></div>}
        {course.type==='internship' && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-800">📋 Next: Sign the Internship Agreement</div>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-bold text-gray-600">Cancel</button>
          <button type="submit" disabled={loading}
            className="flex-1 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60"
            style={{ background:'linear-gradient(135deg,#0077b6,#04065c)' }}>
            {course.isPaid ? 'Next: Payment →' : course.type==='internship' ? 'Next: Agreement →' : (loading?'Submitting...':'Submit Application →')}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function ModalShell({ children, onClose, title, subtitle }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background:'rgba(3,4,94,0.7)', backdropFilter:'blur(6px)' }}
        onClick={e => { if(e.target===e.currentTarget) onClose() }}>
        <motion.div initial={{ scale:0.9, opacity:0, y:20 }} animate={{ scale:1, opacity:1, y:0 }}
          exit={{ scale:0.9, opacity:0, y:20 }} transition={{ type:'spring', stiffness:280, damping:26 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
          <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-500 hover:bg-gray-200">✕</button>
          <h2 className="mb-1 text-xl font-extrabold text-gray-900">{title || 'Apply for Course / Internship'}</h2>
          <p className="mb-5 text-xs text-gray-400">{subtitle || 'Review your details and complete the application'}</p>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
