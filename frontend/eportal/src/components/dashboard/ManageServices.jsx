import { useState, useEffect } from 'react'
import api from '../../utils/api'

const EMPTY = { title:'', description:'', icon:'📋', tag:'Service', bgFrom:'#04065c', bgTo:'#0077b6', accent:'#48cae4', order:0 }

export default function ManageServices() {
  const [services, setServices] = useState([])
  const [form, setForm]         = useState(EMPTY)
  const [editId, setEditId]     = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg]           = useState(null)
  const [loading, setLoading]   = useState(false)

  const fetchServices = async () => {
    try {
      const res = await api.get('/services/all')
      setServices(res.data)
    } catch { setMsg({ type:'error', text:'Failed to load services' }) }
  }

  useEffect(() => { fetchServices() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, order: Number(form.order) }
      if (editId) {
        await api.patch(`/services/${editId}`, payload)
        setMsg({ type:'success', text:'Service updated!' })
      } else {
        await api.post('/services', payload)
        setMsg({ type:'success', text:'Service created!' })
      }
      setForm(EMPTY); setEditId(null); setShowForm(false)
      fetchServices()
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Failed' })
    } finally { setLoading(false) }
  }

  const handleEdit = (svc) => { setForm(svc); setEditId(svc._id); setShowForm(true); setMsg(null) }

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return
    try { await api.delete(`/services/${id}`); setMsg({ type:'success', text:'Deleted!' }); fetchServices() }
    catch { setMsg({ type:'error', text:'Delete failed' }) }
  }

  const toggleActive = async (svc) => {
    try { await api.patch(`/services/${svc._id}`, { isActive: !svc.isActive }); fetchServices() } catch {}
  }

  const inputCls = 'w-full rounded-xl border border-primary-pale bg-primary-ice px-3 py-2.5 text-sm outline-none focus:border-primary-blue focus:bg-white'
  const labelCls = 'mb-1 block text-sm font-semibold text-gray-700'

  return (
    <div className="space-y-5">
      {msg && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${msg.type==='success'?'bg-primary-pale text-primary':'bg-rose-50 text-rose-700'}`}>
          {msg.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{services.length} service(s)</p>
        <button onClick={() => { setShowForm(!showForm); setForm(EMPTY); setEditId(null); setMsg(null) }}
          className="rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
          style={{ background:'linear-gradient(135deg,#0077b6,#04065c)' }}>
          {showForm ? 'Cancel' : '+ Add Service'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-primary-pale bg-white p-6 shadow-sm">
          <h3 className="mb-5 font-bold text-gray-900">{editId ? 'Edit Service' : 'Add New Service'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={labelCls}>Title *</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required className={inputCls} placeholder="Fee Concession" /></div>
              <div><label className={labelCls}>Tag</label><input value={form.tag} onChange={e=>setForm({...form,tag:e.target.value})} className={inputCls} placeholder="Financial Aid" /></div>
            </div>
            <div><label className={labelCls}>Description *</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required rows="3" className={inputCls} placeholder="Service description..." /></div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div><label className={labelCls}>Icon</label><input value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})} className={inputCls} placeholder="💰" /></div>
              <div><label className={labelCls}>BG From</label><input value={form.bgFrom} onChange={e=>setForm({...form,bgFrom:e.target.value})} className={inputCls} placeholder='#04065c' /></div>
              <div><label className={labelCls}>BG To</label><input value={form.bgTo} onChange={e=>setForm({...form,bgTo:e.target.value})} className={inputCls} placeholder='#0077b6' /></div>
              <div><label className={labelCls}>Accent</label><input value={form.accent} onChange={e=>setForm({...form,accent:e.target.value})} className={inputCls} placeholder='#48cae4' /></div>
            </div>
            <div><label className={labelCls}>Order (display order)</label><input type="number" value={form.order} onChange={e=>setForm({...form,order:e.target.value})} className={inputCls} /></div>
            <button type="submit" disabled={loading}
              className="rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              style={{ background:'linear-gradient(135deg,#0077b6,#04065c)' }}>
              {loading ? 'Saving...' : (editId ? '💾 Update' : '✅ Create Service')}
            </button>
          </form>
        </div>
      )}

      {services.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-primary-pale py-12 text-center">
          <p className="text-3xl">🛠️</p>
          <p className="mt-2 text-gray-500">No services yet. Add your first service.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map(svc => (
            <div key={svc._id} className="flex flex-col gap-3 rounded-2xl border border-primary-pale bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                  style={{ background:`linear-gradient(135deg,${svc.bgFrom},${svc.bgTo})` }}>
                  {svc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-gray-900">{svc.title}</p>
                    <span className="rounded-full bg-primary-pale px-2 py-0.5 text-[10px] font-bold text-primary">{svc.tag}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${svc.isActive?'bg-primary-pale text-primary':'bg-gray-100 text-gray-500'}`}>
                      {svc.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{svc.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => toggleActive(svc)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${svc.isActive?'bg-gray-100 text-gray-600 hover:bg-gray-200':'bg-primary-pale text-primary hover:bg-primary-pale'}`}>
                  {svc.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleEdit(svc)}
                  className="rounded-lg bg-primary-pale px-3 py-1.5 text-xs font-semibold text-primary-blue transition hover:bg-primary-pale">
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(svc._id)}
                  className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100">
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
