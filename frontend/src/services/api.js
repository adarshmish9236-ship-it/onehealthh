import axios from 'axios'
import { auth } from './firebase'

// Unified API client — all traffic routes through /api/v1
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request Interceptor: Attach raw Firebase JWT ID Token as Bearer header
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken(/* forceRefresh= */ false)
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: surface structured backend errors; redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.error?.message || error.message

    if (status === 401) {
      auth.signOut().catch(() => {})
      window.location.href = '/login'
    }

    console.error(`[API] ${status ?? 'Network'} — ${message}`)
    return Promise.reject(error)
  }
)

export default api
