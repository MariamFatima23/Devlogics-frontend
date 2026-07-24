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

  // Fix broken double-URL pattern produced by old code:
  // "https://backend.vercel.app/uploads/https://res.cloudinary.com/..."
  // OR "https://backend.vercel.app/uploads/https:/res.cloudinary.com/..."
  const doubleUrlMatch = path.match(/\/uploads\/(https?:\/?\/.+)$/)
  if (doubleUrlMatch) {
    // Reconstruct with exactly double slash
    return doubleUrlMatch[1].replace(/^(https?):\/+/, '$1://')
  }

  // Already a full URL (Cloudinary or any https link) — return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  // Local dev fallback — prepend backend base + /uploads/
  return `${BASE}/uploads/${path}`
}

// ── CV / document view URL helper ────────────────────────────────
// Cloudinary stores PDFs/DOCs as resource_type=raw.
// For PDFs: route through Google Docs Viewer for in-browser preview.
// For DOC/DOCX: direct Cloudinary URL (browser will download).
// Also handles the case where a broken /uploads/https:/ URL was stored.
export const cvViewUrl = (path) => {
  if (!path) return null

  // Fix broken double-URL: "/uploads/https://..." or "/uploads/https:/..."
  // This can happen if old data has prefix baked in
  const cleaned = path.replace(/^.*\/uploads\/(https?:\/?\/)/, (_, p) =>
    p.startsWith('https') ? 'https://' : 'http://'
  )

  const url = fileUrl(cleaned)
  if (!url) return null

  // Cloudinary raw resource (PDF / DOC / DOCX)
  if (url.includes('res.cloudinary.com') && url.includes('/raw/upload/')) {
    // Detect PDF by URL (public_id ends with .pdf or no extension → assume PDF)
    const lowerUrl = url.toLowerCase()
    const isPdf = lowerUrl.includes('.pdf') || (!lowerUrl.includes('.doc'))
    if (isPdf) {
      // Google Docs viewer for inline PDF preview
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
    }
    // DOC/DOCX — direct download is fine
    return url
  }

  return url
}
