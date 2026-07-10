import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const departments = [
  'Computer Science', 'Software Engineering', 'Electrical Engineering',
  'Mechanical Engineering', 'Business Administration', 'Mathematics',
  'Physics', 'Chemistry', 'English', 'Other',
]
const batchesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']

export default function Profile({ user }) {
  const { login } = useAuth()
  const [isEditing, setIsEditing]   = useState(false)
  const [loading, setLoading]       = useState(false)
  const [message, setMessage]       = useState(null)
  const [profileImage, setProfileImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  const [formData, setFormData] = useState({
    name:       user?.name       || '',
    phone:      user?.phone      || '',
    rollNumber: user?.rollNumber || '',
    department: user?.department || '',
    batchester:   user?.batchester   || '',
  })

  useEffect(() => {
    setFormData({
      name:       user?.name       || '',
      phone:      user?.phone      || '',
      rollNumber: user?.rollNumber || '',
      department: user?.department || '',
      batchester:   user?.batchester   || '',
    })
  }, [user])

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProfileImage(file)
    const reader = new FileReader()
    reader.onload = () => setPreviewImage(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v))
      if (profileImage) fd.append('profileImage', profileImage)

      const res = await api.patch('/users/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // ✅ FIX: Backend naya token bhejta hai updated naam ke saath
      // Navbar turant update ho jaati hai — logout ki zaroorat nahi
      login(res.data.user, res.data.token)

      setMessage({ type: 'success', text: 'Profile updated! ' })
      setIsEditing(false)
      setProfileImage(null)
      setPreviewImage(null)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' })
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setPreviewImage(null)
    setProfileImage(null)
    setMessage(null)
    setFormData({
      name:       user?.name       || '',
      phone:      user?.phone      || '',
      rollNumber: user?.rollNumber || '',
      department: user?.department || '',
      batchester:   user?.batchester   || '',
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
            : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
        }`}>
          <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
          {message.text}
        </div>
      )}

      {/* Profile Card */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">

        {/* Top Banner */}
        <div className="h-24 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600" />

        {/* Avatar + Info */}
        <div className="relative px-6 pb-5">
          <div className="-mt-12 flex items-end justify-between">
            <div className="relative">
              {previewImage ? (
                <img src={previewImage} alt="" className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white shadow-lg" />
              ) : user?.profileImage ? (
                <img src={`http://localhost:5000/uploads/${user.profileImage}`} alt="" className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white shadow-lg" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0077b6] text-2xl font-extrabold text-white ring-4 ring-white shadow-lg">
                  {initials}
                </div>
              )}

              {isEditing && (
                <label className="absolute -bottom-2 -right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#0077b6] text-white shadow-lg transition hover:bg-indigo-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>

            {!isEditing && (
              <button onClick={() => setIsEditing(true)}
                className="mb-1 flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-batchibold text-gray-700 shadow-sm transition hover:border-indigo-300 hover:bg-[#e0f7fa] hover:text-[#023e8a]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>

          <div className="mt-3">
            <h2 className="text-xl font-extrabold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-lg bg-[#e0f7fa] px-2.5 py-0.5 text-xs font-bold text-[#023e8a] capitalize">
                {user?.role}
              </span>
              {user?.department && (
                <span className="rounded-lg bg-gray-100 px-2.5 py-0.5 text-xs font-batchibold text-gray-600">
                  {user.department}
                </span>
              )}
              {user?.batchester && (
                <span className="rounded-lg bg-gray-100 px-2.5 py-0.5 text-xs font-batchibold text-gray-600">
                  {user.batchester} batchester
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h3 className="mb-5 text-base font-bold text-gray-900">Edit Profile Information</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-batchibold text-gray-700">Full Name *</label>
                <input type="text" value={formData.name} required
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-[#0077b6]-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-batchibold text-gray-700">Phone</label>
                <input type="tel" value={formData.phone} placeholder="03XX-XXXXXXX"
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-[#0077b6]-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-batchibold text-gray-700">Roll Number</label>
              <input type="text" value={formData.rollNumber} placeholder="e.g. CS-2021-001"
                onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-[#0077b6]-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-batchibold text-gray-700">Department</label>
                <select value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white">
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-batchibold text-gray-700">batchester</label>
                <select value={formData.batchester}
                  onChange={e => setFormData({ ...formData, batchester: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white">
                  <option value="">Select batchester</option>
                  {batchesters.map(s => <option key={s} value={s}>{s} batchester</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0077b6] py-2.5 text-sm font-batchibold text-white transition hover:bg-indigo-700 disabled:opacity-60">
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
              <button type="button" onClick={cancelEdit}
                className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-batchibold text-gray-700 transition hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* View Mode */
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-sm font-bold text-gray-900">Account Details</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { label: 'Full Name',   value: user?.name,              icon: '👤' },
              { label: 'Email',       value: user?.email,             icon: '✉️' },
              { label: 'Role',        value: user?.role,              icon: '🎭' },
              { label: 'Roll Number', value: user?.rollNumber,        icon: '🎓' },
              { label: 'Department',  value: user?.department,        icon: '🏛️' },
              { label: 'batchester',    value: user?.batchester,          icon: '📅' },
              { label: 'Phone',       value: user?.phone,             icon: '📞' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm font-batchibold text-gray-500">{item.label}</span>
                </div>
                <span className={`text-sm ${item.value ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                  {item.value || 'Not provided'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

