import axios from 'axios'

// Use Vite environment variable with fallback
// In production: VITE_API_BASE_URL must be set at build time
// In development: use env var or default to localhost:8001
const baseURL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';

// Debug logging
console.log('🔍 API Client Configuration:');
console.log('  baseURL:', baseURL);
console.log('  Mode:', import.meta.env.MODE);
console.log('  PROD:', import.meta.env.PROD);

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor with enhanced error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const message = error.response.data?.message || error.message

      switch (status) {
        case 401:
          localStorage.removeItem('authToken')
          // Optionally redirect to login
          break
        case 404:
          console.error('Resource not found:', message)
          break
        case 422:
          console.error('Validation error:', error.response.data)
          break
        case 500:
          console.error('Server error:', message)
          break
        default:
          console.error('API error:', message)
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error: No response from server')
    } else {
      // Error in request setup
      console.error('Request error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default apiClient

