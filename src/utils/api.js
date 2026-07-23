import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401 (token expired)
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ── Shared file URL helper ────────────────────────────────────────
// If value is already a full URL (Cloudinary), return as-is.
// Otherwise prefix with backend /uploads/ for local dev.
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')
export const fileUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${BASE}/uploads/${path}`
}
