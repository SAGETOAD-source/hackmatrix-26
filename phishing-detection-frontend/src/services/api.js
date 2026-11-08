import axios from 'axios'

// Environment variable retrieval
const getEnvVar = (key, fallback) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key]
    }
  } catch {
    // ignore
  }
  return fallback
}

const DEFAULT_API_BASE_URL = getEnvVar('VITE_API_BASE_URL', 'http://localhost:5000/api/v1')
const DEFAULT_DATA_MODE = getEnvVar('VITE_DATA_MODE', 'api').toLowerCase()

const MODE_STORAGE_KEY = 'phishguard_data_mode'

/**
 * Get current data mode ('api' | 'demo')
 * Users can toggle between live backend API and demonstration mode
 */
export function getDataMode() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(MODE_STORAGE_KEY)
      if (stored === 'api' || stored === 'demo' || stored === 'mock') {
        return stored === 'mock' ? 'demo' : stored
      }
    } catch {
      // ignore storage access errors
    }
  }
  return DEFAULT_DATA_MODE === 'demo' || DEFAULT_DATA_MODE === 'mock' ? 'demo' : 'api'
}

/**
 * Set the current data mode ('api' | 'demo')
 */
export function setDataMode(mode) {
  const normalized = mode === 'demo' || mode === 'mock' ? 'demo' : 'api'
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(MODE_STORAGE_KEY, normalized)
      window.dispatchEvent(new CustomEvent('phishguard:mode-changed', { detail: { mode: normalized } }))
    } catch {
      // ignore
    }
  }
  return normalized
}

/**
 * Check if the frontend is configured to communicate with the live backend API.
 * @returns {boolean}
 */
export function isApiMode() {
  return getDataMode() === 'api'
}

/**
 * Get the configured API base URL
 * @returns {string}
 */
export function getApiBaseUrl() {
  return DEFAULT_API_BASE_URL
}

/**
 * Centralized Axios client instance
 */
export const apiClient = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  timeout: 20000, // 20s timeout for deep analysis & network latency
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor: attach bearer token if authenticated
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // Storage access error in private browsing
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: normalize error format, CORS, timeouts, and auth
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status || 0
    let message = 'An unexpected API error occurred'
    let isCorsError = false
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout')
    const isNetworkError = !error.response && !isTimeout

    if (error.response?.data?.message) {
      message = error.response.data.message
    } else if (error.response?.data?.error) {
      message = typeof error.response.data.error === 'string'
        ? error.response.data.error
        : error.response.data.error.message || JSON.stringify(error.response.data.error)
    } else if (isTimeout) {
      message = 'Backend API request timed out (20s limit exceeded). The server may be processing heavy analysis.'
    } else if (isNetworkError) {
      // Likely CORS blocked or backend offline
      isCorsError = true
      message = `Cannot reach backend API at ${DEFAULT_API_BASE_URL}. Verify backend server is running and CORS allows origin.`
    } else if (status === 401) {
      message = 'Authentication token required or expired. Please sign in as an analyst.'
    } else if (status === 403) {
      message = 'Access forbidden. You do not have permission to perform this scan action.'
    } else if (status === 404) {
      message = 'Requested API resource or scan record not found on server.'
    } else if (status === 429) {
      message = 'Too many requests. Rate limit exceeded. Please wait a moment before retrying.'
    } else if (status >= 500) {
      message = 'Internal backend server error. Check backend server logs.'
    }

    const normalized = {
      message,
      status,
      isNetworkError,
      isCorsError,
      isTimeout,
      isAuthError: status === 401,
      isRateLimited: status === 429,
      data: error.response?.data,
      originalError: error,
    }
    return Promise.reject(normalized)
  }
)

/**
 * Health check helper to verify connectivity to backend API
 * @returns {Promise<{ isHealthy: boolean, details?: object, error?: string }>}
 */
export async function checkBackendHealth() {
  try {
    const response = await apiClient.get('/health', { timeout: 5000 })
    return {
      isHealthy: response.data?.success === true,
      details: response.data,
    }
  } catch (err) {
    return {
      isHealthy: false,
      error: err.message || 'Backend unreachable',
      status: err.status,
    }
  }
}

export default apiClient
