import apiClient from './api.js'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

/**
 * Log in an analyst user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function login(email, password) {
  const response = await apiClient.post('/auth/login', {
    email: email.trim(),
    password,
  })

  const { user, token } = response.data?.data || {}
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
    window.dispatchEvent(new CustomEvent('phishguard:auth-changed', { detail: { isAuthenticated: true, user } }))
  }
  return { user, token }
}

/**
 * Register a new user
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>}
 */
export async function register(name, email, password) {
  const response = await apiClient.post('/auth/register', {
    name: name.trim(),
    email: email.trim(),
    password,
  })
  return response.data?.data?.user
}

/**
 * Fetch current user profile from backend
 * @returns {Promise<object>}
 */
export async function getCurrentUser() {
  const token = getAuthToken()
  if (!token) return null

  try {
    const response = await apiClient.get('/auth/me')
    const user = response.data?.data?.user
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
    return user
  } catch (error) {
    if (error.status === 401) {
      logout()
    }
    throw error
  }
}

/**
 * Log out and clear cached credentials
 */
export function logout() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    window.dispatchEvent(new CustomEvent('phishguard:auth-changed', { detail: { isAuthenticated: false, user: null } }))
  } catch {
    // ignore
  }
}

/**
 * Get current stored JWT token
 * @returns {string|null}
 */
export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

/**
 * Check if an active token exists
 * @returns {boolean}
 */
export function isAuthenticated() {
  return Boolean(getAuthToken())
}

/**
 * Get currently cached user profile
 * @returns {object|null}
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default {
  login,
  register,
  getCurrentUser,
  logout,
  getAuthToken,
  isAuthenticated,
  getStoredUser,
}

