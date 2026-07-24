import { useState, useEffect } from 'react'
import api, { fileUrl, cvViewUrl } from '../../utils/api'
import toast from 'react-hot-toast'
const CARD_BG = 'var(--theme-grad-primary)'

const STATUS_META = {
  Pending:        { cls: 'bg-amber-400/20 text-amber-200 border border-amber-400/30',  dot: '#fbbf24' },
  'Under Review': { cls: 'bg-blue-400/20 text-blue-200 border border-blue-400/30',     dot: '#93c5fd' },
  Approved:       { cls: 'bg-green-400/20 text-green-200 border border-green-400/30',  dot: '#4ade80' },
  Rejected:       { cls: 'bg-rose-400/20 text-rose-200 border border-rose-400/30',     dot: '#f87171' },
}

function InstallmentTracker({ app, onPaymentSubmit }) {
  const [openInst, setOpenInst] = useState(null)
  const [form, setForm]         = useState({ paymentMethod: '', transactionId: '' })
  const [proofFile, setProofFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!app.installments?.length) return null

  const paid      = app.amountPaid      || 0
  const total     = app.totalFee        || 0
  const remaining = app.amountRemaining || 0
  const pct       = total > 0 ? Math.round((paid / total) * 100) : 0

  const handleSubmit = async (instNo) => {
    if (!form.paymentMethod || !proofFile) { toast.error('Method and screenshot required'); return }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('installmentNo',  instNo)
      fd.append('paymentMethod',  form.paymentMethod)
      fd.append('transactionId',  form.transactionId)
      fd.append('proofFile',      proofFile)
      await api.post(`/course-applications/${app._id}/installment`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Installment submitted!')
      setOpenInst(null); setForm({ paymentMethod: '', transactionId: '' }); setProofFile(null)
      onPaymentSubmit()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Payment Progress</span>
          <span className="font-bold text-white">{pct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div className="h-2 rounded-full transition-all duration-700 bg-gradient-to-r from-cyan-400 to-green-400"
            style={{ width: `${pct}%` }}/>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-green-300 font-semibold">Paid: PKR {paid.toLocaleString()}</span>
          <span className="text-amber-300 font-semibold">Remaining: PKR {remaining.toLocaleString()}</span>
        </div>
      </div>

      {/* Installment rows */}
      <div className="space-y-2">
        {app.installments.map(inst => {
          const isNext = inst.status === 'pending' && app.installments.filter(i => i.status === 'pending').findIndex(i => i.installmentNo === inst.installmentNo) === 0
          return (
            <div key={inst.installmentNo}
              className="rounded-xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                  inst.status === 'paid' ? 'bg-green-400/20 text-green-300' :
                  inst.status === 'overdue' ? 'bg-rose-400/20 text-rose-300' :
                  'bg-white/10 text-white/60'
                }`}>
                  {inst.status === 'paid' ? '✓' : inst.installmentNo}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">
                    Installment #{inst.installmentNo} — PKR {inst.amount?.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/40">
                    Due: {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString('en-PK', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                    {inst.paidDate && ` · Paid: ${new Date(inst.paidDate).toLocaleDateString('en-PK', { day:'numeric', month:'short' })}`}
                  </p>
                </div>
                <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                  inst.status === 'paid'   ? 'bg-green-400/20 text-green-300' :
                  inst.status === 'overdue'? 'bg-rose-400/20 text-rose-300' :
                  isNext                   ? 'bg-amber-400/20 text-amber-300' :
                  'bg-white/10 text-white/40'
                }`}>
                  {inst.status === 'paid' ? '✅ Paid' : inst.status === 'overdue' ? '⚠️ Overdue' : isNext ? '⏳ Due Now' : '🔒 Upcoming'}
                </span>
              </div>

              {/* Pay now panel — only for next pending */}
              {isNext && inst.status === 'pending' && (
                <div className="border-t border-white/10 px-4 pb-4 pt-3 space-y-3">
                  {openInst === inst.installmentNo ? (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-white/50">Payment Method</label>
                          <input value={form.paymentMethod} onChange={e => setForm(p => ({...p, paymentMethod: e.target.value}))}
                            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400"
                            placeholder="JazzCash / Bank"/>
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-white/50">Transaction ID</label>
                          <input value={form.transactionId} onChange={e => setForm(p => ({...p, transactionId: e.target.value}))}
                            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400"
                            placeholder="TXN..."/>
                        </div>
                      </div>
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-amber-400/30 p-3 hover:border-amber-400 transition">
                        <span>🧾</span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-white/70">{proofFile ? proofFile.name : 'Upload payment screenshot'}</p>
                        </div>
                        <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => setProofFile(e.target.files[0])}/>
                      </label>
                      <div className="flex gap-2">
                        <button onClick={() => setOpenInst(null)}
                          className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white/60">Cancel</button>
                        <button onClick={() => handleSubmit(inst.installmentNo)} disabled={submitting}
                          className="flex-1 rounded-xl py-2 text-xs font-bold text-white disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg,#0077b6,#03045e)' }}>
                          {submitting ? 'Submitting...' : '✅ Submit Payment'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <button onClick={() => setOpenInst(inst.installmentNo)}
                      className="w-full rounded-xl py-2 text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#d97706,#92400e)' }}>
                      💳 Pay Installment #{inst.installmentNo} — PKR {inst.amount?.toLocaleString()}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function MyCourseApplications() {
  const [apps, setApps]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState(null)

  const fetchApps = () => {
    api.get('/course-applications/my')
      .then(r => {
        const data = r.data
        const apps = Array.isArray(data) ? data : (data?.applications || data?.data || [])
        setApps(apps)
      })
      .catch(() => setApps([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchApps() }, [])

  if (loading) return (
    <div className="space-y-3">
      {[1,2].map(i => <div key={i} className="h-20 animate-pulse rounded-2xl" style={{ background: CARD_BG, opacity: 0.4 }}/>)}
    </div>
  )

  if (!Array.isArray(apps) || !apps.length) return (
    <div className="rounded-2xl py-16 text-center" style={{ background: CARD_BG }}>
      <p className="text-4xl">📋</p>
      <p className="mt-3 font-bold text-white">No course applications yet</p>
      <p className="mt-1 text-sm text-white/50">Browse available courses and apply to get started.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {apps.map(app => {
        const sm = STATUS_META[app.status] || STATUS_META['Pending']
        const open = expanded === app._id
        return (
          <div key={app._id} className="rounded-2xl overflow-hidden shadow-lg" style={{ background: CARD_BG }}>
            {/* Header row */}
            <button
              onClick={() => setExpanded(open ? null : app._id)}
              className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-white/5 transition">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl font-extrabold text-white"
                style={{ background: 'rgba(255,255,255,0.15)' }}>
                📚
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <p className="font-extrabold text-white truncate">{app.courseName}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${sm.cls}`}>{app.status}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/60 capitalize">{app.courseType}</span>
                </div>
                <p className="text-xs text-white/40">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="text-white/40 text-xs">{open ? '▲' : '▼'}</span>
            </button>

            {/* Progress bar */}
            <div className="h-0.5 w-full bg-white/10">
              <div className="h-0.5 rounded-full transition-all duration-700"
                style={{
                  width: app.status==='Approved'?'100%': app.status==='Under Review'?'66%': app.status==='Rejected'?'100%':'33%',
                  background: sm.dot,
                }}/>
            </div>

            {/* Expanded detail */}
            {open && (
              <div className="px-5 pb-5 pt-4 space-y-4 border-t border-white/10">
                <div className="grid gap-3 rounded-xl p-4 sm:grid-cols-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {[
                    ['Qualification', app.qualification],
                    ['Experience',    app.experience || 'None'],
                    ['Phone',         app.phone],
                    ['Payment',       app.paymentMethod || '—'],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">{label}</p>
                      <p className="text-sm font-semibold text-white/80">{val}</p>
                    </div>
                  ))}
                </div>

                {app.adminComment && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1">Admin Feedback</p>
                    <p className="text-sm text-white/70">{app.adminComment}</p>
                  </div>
                )}

                {/* Payment tracker */}
                {app.installments?.length > 0 && (
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/30">Payment Tracker</p>
                    <InstallmentTracker app={app} onPaymentSubmit={fetchApps}/>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {app.cvFile && (
                    <a href={cvViewUrl(app.cvFile)} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-300 hover:bg-white/20 transition">
                      📄 View CV
                    </a>
                  )}
                  {app.paymentProof && (
                    <a href={fileUrl(app.paymentProof)} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-400/15 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-400/25 transition">
                      🧾 Payment Proof
                    </a>
                  )}
                  {app.signatureFile && (
                    <a href={fileUrl(app.signatureFile)} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-purple-400/15 px-4 py-2 text-sm font-semibold text-purple-300 hover:bg-purple-400/25 transition">
                      ✍️ Signature
                    </a>
                  )}
                </div>

                {app.timeline?.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-white/30">Timeline</p>
                    <div className="space-y-2">
                      {app.timeline.map((t, i) => (
                        <div key={i} className="flex items-start gap-3 text-xs">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400"/>
                          <div>
                            <span className="font-bold text-white/80">{t.status}</span>
                            {t.comment && <span className="text-white/40"> — {t.comment}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
