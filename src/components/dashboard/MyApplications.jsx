import { useState, useEffect } from 'react'
import api from '../../utils/api'

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const APPLICATION_TYPES = [
  'Fee Concession',
  'Scholarship',
  'Character Certificate',
  'Hostel Allocation',
  'Transcript Request',
  'Complaint',
]

const STATUS_COLORS = {
  Pending:       'bg-amber-100 text-amber-700',
  'Under Review':'bg-blue-100 text-blue-700',
  Approved:      'bg-primary-pale text-primary',
  Rejected:      'bg-rose-100 text-rose-700',
}

const STATUS_ICONS = {
  Pending: '?', 'Under Review': '??', Approved: '?', Rejected: '?',
}

function MyApplications() {
  const [view, setView]               = useState('list')      // 'list' | 'form' | 'detail'
  const [applications, setApplications] = useState([])
  const [selected, setSelected]       = useState(null)
  const [loading, setLoading]         = useState(false)
  const [fetching, setFetching]       = useState(true)
  const [message, setMessage]         = useState('')

  const [formData, setFormData] = useState({
    type: '', title: '', description: '',
    rollNumber: '', department: '', batchester: '',
  })
  const [files, setFiles] = useState([])

  // Fetch applications
  const fetchApps = async () => {
    setFetching(true)
    try {
      const res = await api.get('/applications/my-applications')
      setApplications(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
      setApplications([])
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => { fetchApps() }, [])

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.type || !formData.title || !formData.description) {
      setMessage({ type: 'error', text: 'Please fill all required fields' })
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v))
      files.forEach((f) => fd.append('attachments', f))

      await api.post('/applications', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setMessage({ type: 'success', text: 'Application submitted successfully!' })
      setFormData({ type: '', title: '', description: '', rollNumber: '', department: '', batchester: '' })
      setFiles([])
      setView('list')
      fetchApps()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Submission failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files))
  }

  const openDetail = (app) => {
    setSelected(app)
    setView('detail')
  }

  // --- Application List ---
  if (view === 'list') {
    return (
      <div>
        {message && (
          <div className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${message.type === 'success' ? 'bg-primary-pale text-primary' : 'bg-rose-50 text-rose-700'}`}>
            {message.text}
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">{applications.length} application(s) total</p>
          <button onClick={() => { setView('form'); setMessage('') }}
            className="rounded-lg bg-primary-blue px-4 py-2 text-sm font-batchibold text-white transition hover:opacity-80">
            + New Application
          </button>
        </div>

        {fetching ? (
          <div className="py-12 text-center text-slate-500">Loading...</div>
        ) : applications.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
            <p className="text-4xl">??</p>
            <p className="mt-3 text-lg font-batchibold text-slate-600">No Applications Yet</p>
            <p className="mt-1 text-sm text-slate-400">Submit your first application to get started</p>
            <button onClick={() => setView('form')}
              className="mt-4 rounded-lg bg-primary-blue px-5 py-2 text-sm font-batchibold text-white hover:opacity-80">
              Submit Application
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app._id}
                className="flex cursor-pointer flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary-pale hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                onClick={() => openDetail(app)}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-primary-pale px-2 py-0.5 text-xs font-batchibold text-primary-mid">
                      {app.type}
                    </span>
                  </div>
                  <p className="mt-1 font-batchibold text-slate-900">{app.title}</p>
                  <p className="text-sm text-slate-500 line-clamp-1">{app.description}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Submitted: {new Date(app.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-batchibold ${STATUS_COLORS[app.status]}`}>
                    {STATUS_ICONS[app.status]} {app.status}
                  </span>
                  <span className="text-slate-400">?</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // --- Application Form ---
  if (view === 'form') {
    return (
      <div className="mx-auto max-w-2xl">
        <button onClick={() => setView('list')} className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
          ? Back to Applications
        </button>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-xl font-bold text-slate-900">Submit New Application</h2>
          <p className="mb-5 text-sm text-slate-500">Fill in the details below and attach required documents.</p>

          {message && (
            <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${message.type === 'success' ? 'bg-primary-pale text-primary' : 'bg-rose-50 text-rose-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Application Type */}
            <div>
              <label className="mb-1 block text-sm font-batchibold text-slate-700">Application Type *</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white">
                <option value="">Select type</option>
                {APPLICATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="mb-1 block text-sm font-batchibold text-slate-700">Title *</label>
              <input type="text" value={formData.title} placeholder="Brief title of your application"
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-batchibold text-slate-700">Description *</label>
              <textarea value={formData.description} rows="4" placeholder="Explain your request in detail..."
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            {/* Academic Info */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-batchibold text-slate-700">Roll Number</label>
                <input type="text" value={formData.rollNumber} placeholder="CS-2021-001"
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-batchibold text-slate-700">Department</label>
                <input type="text" value={formData.department} placeholder="Computer Science"
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-batchibold text-slate-700">batchester</label>
                <input type="text" value={formData.batchester} placeholder="4th"
                  onChange={(e) => setFormData({ ...formData, batchester: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="mb-1 block text-sm font-batchibold text-slate-700">
                Attach Documents <span className="font-normal text-slate-400">(PDF, JPG, PNG, DOC � max 5MB each)</span>
              </label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 transition hover:border-indigo-400 hover:bg-primary-pale">
                <span className="text-3xl">??</span>
                <span className="mt-2 text-sm font-batchibold text-slate-600">Click to upload files</span>
                <span className="text-xs text-slate-400">or drag and drop</span>
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={handleFileChange} />
              </label>
              {files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-primary-pale px-3 py-2 text-sm">
                      <span>??</span>
                      <span className="flex-1 truncate font-medium text-primary-mid">{f.name}</span>
                      <span className="text-xs text-slate-400">{(f.size / 1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 rounded-lg bg-primary-blue py-2.5 text-sm font-batchibold text-white transition hover:opacity-80 disabled:opacity-60">
                {loading ? 'Submitting...' : '?? Submit Application'}
              </button>
              <button type="button" onClick={() => setView('list')}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-batchibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // --- Application Detail ---
  if (view === 'detail' && selected) {
    return (
      <div className="mx-auto max-w-2xl">
        <button onClick={() => setView('list')} className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
          ? Back to Applications
        </button>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          {/* Header */}
          <div className="mb-5 flex items-start justify-between">
            <div>
              <span className="rounded-md bg-primary-pale px-2 py-0.5 text-xs font-batchibold text-primary-mid">{selected.type}</span>
              <h2 className="mt-2 text-xl font-bold text-slate-900">{selected.title}</h2>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-batchibold ${STATUS_COLORS[selected.status]}`}>
              {STATUS_ICONS[selected.status]} {selected.status}
            </span>
          </div>

          {/* Info Grid */}
          <div className="mb-5 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
            {[
              { label: 'Roll Number', value: selected.rollNumber || 'N/A' },
              { label: 'Department', value: selected.department || 'N/A' },
              { label: 'batchester', value: selected.batchester || 'N/A' },
              { label: 'Submitted', value: new Date(selected.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-xs font-batchibold uppercase text-slate-400">{item.label}</p>
                <p className="text-sm font-medium text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mb-5">
            <p className="mb-1 text-xs font-batchibold uppercase text-slate-400">Description</p>
            <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{selected.description}</p>
          </div>

          {/* Attachments */}
          {selected.attachments?.length > 0 && (
            <div className="mb-5">
              <p className="mb-2 text-xs font-batchibold uppercase text-slate-400">Attached Documents</p>
              <div className="space-y-2">
                {selected.attachments.map((att, i) => {
                  const url = att.filePath?.startsWith('http')
                    ? att.filePath
                    : `${BASE}/uploads/${att.fileName}`
                  return (
                    <a key={i} href={url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm transition hover:border-indigo-300 hover:bg-primary-pale">
                    <span className="text-lg">??</span>
                    <span className="flex-1 font-medium text-primary-mid">{att.originalName}</span>
                    <span className="text-xs text-slate-400">{(att.fileSize / 1024).toFixed(0)} KB</span>
                    <span className="text-xs text-indigo-500">Open ?</span>
                  </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* Admin Response */}
          {(selected.adminComment || selected.rejectionReason) && (
            <div className={`rounded-lg p-4 ${selected.status === 'Rejected' ? 'bg-rose-50 text-rose-800' : 'bg-primary-pale text-emerald-800'}`}>
              <p className="mb-1 text-xs font-bold uppercase">Admin Response</p>
              <p className="text-sm">{selected.adminComment || selected.rejectionReason}</p>
              {selected.reviewedBy && (
                <p className="mt-1 text-xs opacity-70">By: {selected.reviewedBy} on {new Date(selected.reviewedAt).toLocaleDateString()}</p>
              )}
            </div>
          )}

          {/* Timeline */}
          {selected.timeline?.length > 0 && (
            <div className="mt-5">
              <p className="mb-3 text-xs font-batchibold uppercase text-slate-400">Status Timeline</p>
              <div className="space-y-3">
                {selected.timeline.map((t, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary-pale0" />
                      {i < selected.timeline.length - 1 && <div className="mt-1 h-full w-0.5 bg-slate-200" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-sm font-batchibold text-slate-800">{t.status}</p>
                      <p className="text-xs text-slate-500">{t.comment}</p>
                      <p className="text-xs text-slate-400">{new Date(t.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default MyApplications

