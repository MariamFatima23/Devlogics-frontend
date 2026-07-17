import axios from 'axios'

const api = axios.create({
  // In production (Vercel), VITE_API_URL must be set to your backend URL
  // e.g. https://your-backend.railway.app/api
  // In development, Vite proxy handles /api → localhost:5000
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
