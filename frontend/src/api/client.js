import axios from 'axios'

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api' })

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const unauthorized = error.response?.status === 401
    const onAuthPage = window.location.pathname.match(/^\/(login|register|forgot-password|reset-password)/)
    if (unauthorized && !onAuthPage) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export const errorMessage = (error) =>
  error.response?.data?.message || 'We could not reach the server. Check your connection and try again.'

export default client
