import axios from 'axios'

// Environment variables
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

const API_BASE_URL = getEnvVar('VITE_API_BASE_URL', 'http://localhost:5000/api/v1')
const DATA_MODE = getEnvVar('VITE_DATA_MODE', 'mock').toLowerCase()

/**
 * Check if the frontend is configured to communicate with a live backend API.
 * @returns {boolean}
 */
export function isApiMode() {
  return DATA_MODE === 'api'
}

/**
 * Get the current operating mode ('api' | 'mock')
 * @returns {string}
 */
export function getDataMode() {
  return DATA_MODE
}

/**
 * Get the configured API base URL
 * @returns {string}
 */
export function getApiBaseUrl() {
  return API_BASE_URL
}

/**
 * Centralized Axios client instance
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor: attach bearer token if user is authenticated
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // Storage access error or private mode
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: normalize error format
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = {
      message:
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'An unexpected API error occurred',
      status: error.response?.status || 0,
      isNetworkError: !error.response,
      originalError: error,
    }
    return Promise.reject(normalized)
  }
)

export default apiClient
