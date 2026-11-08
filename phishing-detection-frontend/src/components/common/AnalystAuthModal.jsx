import { useState, useEffect } from 'react'
import {
  X,
  Shield,
  User,
  Key,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Radio,
  Server,
  LogOut,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import {
  login,
  register,
  logout,
  getStoredUser,
  isAuthenticated
} from '../../services/authService'
import {
  getDataMode,
  setDataMode,
  getApiBaseUrl,
  checkBackendHealth
} from '../../services/api'

export default function AnalystAuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState(() => getDataMode())
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [healthStatus, setHealthStatus] = useState(null) // { isHealthy, details, error }
  const [currentUser, setCurrentUser] = useState(() => getStoredUser())
  const [authed, setAuthed] = useState(() => isAuthenticated())

  useEffect(() => {
    const handleAuth = () => {
      setCurrentUser(getStoredUser())
      setAuthed(isAuthenticated())
    }
    const handleMode = () => {
      setMode(getDataMode())
    }
    window.addEventListener('phishguard:auth-changed', handleAuth)
    window.addEventListener('phishguard:mode-changed', handleMode)
    return () => {
      window.removeEventListener('phishguard:auth-changed', handleAuth)
      window.removeEventListener('phishguard:mode-changed', handleMode)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    let isMounted = true
    checkBackendHealth()
      .then((res) => {
        if (isMounted) setHealthStatus(res)
      })
      .catch((err) => {
        if (isMounted) setHealthStatus({ isHealthy: false, error: err.message })
      })

    return () => {
      isMounted = false
    }
  }, [isOpen])

  const handleToggleMode = () => {
    const nextMode = mode === 'api' ? 'demo' : 'api'
    setDataMode(nextMode)
    setMode(nextMode)
  }

  const handleLogin = async (e) => {
    e?.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await login(email, password)
      setCurrentUser(res.user)
      setAuthed(true)
      setSuccess(`Authenticated as ${res.user.name || res.user.email}`)
      setTimeout(() => {
        onClose?.()
      }, 1200)
    } catch (err) {
      setError(err.message || 'Login failed. Verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e?.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await register(name, email, password)
      // Auto login after registration
      const res = await login(email, password)
      setCurrentUser(res.user)
      setAuthed(true)
      setSuccess(`Account registered and logged in as ${name}`)
      setTimeout(() => {
        onClose?.()
      }, 1200)
    } catch (err) {
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAnalyst = async () => {
    setLoading(true)
    setError(null)
    const testEmail = 'analyst@phishguard.internal'
    const testPass = 'AnalystPassword123!'

    try {
      // Try login first
      try {
        const res = await login(testEmail, testPass)
        setCurrentUser(res.user)
        setAuthed(true)
        setSuccess('Logged in as Guest Analyst')
        setTimeout(() => onClose?.(), 1000)
        return
      } catch {
        // If login failed, register then login
        await register('SecOps Analyst', testEmail, testPass)
        const res = await login(testEmail, testPass)
        setCurrentUser(res.user)
        setAuthed(true)
        setSuccess('Provisioned and logged in as SecOps Analyst')
        setTimeout(() => onClose?.(), 1000)
      }
    } catch (err) {
      setError(err.message || 'Could not provision analyst session.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    setCurrentUser(null)
    setAuthed(false)
    setSuccess('Logged out successfully.')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0D1728] border border-[#24344B] rounded-xl shadow-2xl p-6 text-[#F1F5FF]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#24344B]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#111E32] border border-[#287FE9]/30 flex items-center justify-center text-[#287FE9]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-[#F1F5FF]">
                Analyst Session & API Gateway
              </h2>
              <p className="text-[11px] font-mono text-[#9EACC2]">
                PhishGuard SOC Authentication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-md text-[#9EACC2] hover:text-[#F1F5FF] hover:bg-[#111E32] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Operating Mode Selector */}
        <div className="mt-4 p-3 rounded-lg bg-[#111E32] border border-[#24344B] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className={`w-4 h-4 ${mode === 'api' ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div>
              <div className="text-xs font-semibold text-[#F1F5FF] flex items-center space-x-1.5">
                <span>Active Engine:</span>
                <span className={`font-mono uppercase ${mode === 'api' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {mode === 'api' ? 'Live API Gateway' : 'Demonstration Mode'}
                </span>
              </div>
              <div className="text-[10px] text-[#9EACC2]">
                {mode === 'api' ? 'Live PostgreSQL + Express API' : 'Client-side heuristic engine'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleMode}
            className="flex items-center space-x-1 text-xs text-[#55B7FF] hover:text-[#F1F5FF] cursor-pointer"
          >
            {mode === 'api' ? (
              <ToggleRight className="w-6 h-6 text-[#287FE9]" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-[#9EACC2]" />
            )}
            <span className="text-[11px] font-mono">Switch</span>
          </button>
        </div>

        {/* Backend Connectivity Status */}
        <div className="mt-2.5 px-3 py-2 rounded-md bg-[#080F1E] border border-[#24344B] flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center space-x-2 text-[#9EACC2]">
            <Server className="w-3.5 h-3.5 text-[#287FE9]" />
            <span className="truncate max-w-[220px]">{getApiBaseUrl()}</span>
          </div>
          <div>
            {healthStatus === null ? (
              <span className="text-amber-400 flex items-center space-x-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Checking...</span>
              </span>
            ) : healthStatus?.isHealthy ? (
              <span className="text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Online</span>
              </span>
            ) : (
              <span className="text-rose-400 flex items-center space-x-1" title={healthStatus?.error || 'Offline'}>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span>Offline</span>
              </span>
            )}
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mt-3 p-2.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="break-all">{error}</span>
          </div>
        )}
        {success && (
          <div className="mt-3 p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* User Status / Forms */}
        {authed && currentUser ? (
          <div className="mt-4 p-4 rounded-lg bg-[#111E32] border border-[#24344B]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-[#287FE9]/20 border border-[#287FE9]/40 flex items-center justify-center text-[#55B7FF]">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#F1F5FF]">
                    {currentUser.name || 'SecOps Analyst'}
                  </div>
                  <div className="text-[11px] font-mono text-[#9EACC2]">
                    {currentUser.email}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                    Role: {currentUser.role || 'Analyst'} • Token Active
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs flex items-center space-x-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            {/* Tabs */}
            <div className="flex border-b border-[#24344B] mb-3 text-xs">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`flex-1 py-1.5 font-medium border-b-2 cursor-pointer transition-colors ${
                  tab === 'login'
                    ? 'border-[#287FE9] text-[#55B7FF]'
                    : 'border-transparent text-[#9EACC2] hover:text-[#F1F5FF]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`flex-1 py-1.5 font-medium border-b-2 cursor-pointer transition-colors ${
                  tab === 'register'
                    ? 'border-[#287FE9] text-[#55B7FF]'
                    : 'border-transparent text-[#9EACC2] hover:text-[#F1F5FF]'
                }`}
              >
                Register Analyst
              </button>
            </div>

            <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-3">
              {tab === 'register' && (
                <div>
                  <label className="block text-[11px] font-mono text-[#9EACC2] mb-1">
                    Analyst Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9EACC2]" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#080F1E] border border-[#24344B] text-xs text-[#F1F5FF] placeholder-[#9EACC2]/40 focus:outline-none focus:border-[#287FE9]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono text-[#9EACC2] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9EACC2]" />
                  <input
                    type="email"
                    required
                    placeholder="analyst@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#080F1E] border border-[#24344B] text-xs text-[#F1F5FF] placeholder-[#9EACC2]/40 focus:outline-none focus:border-[#287FE9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#9EACC2] mb-1">
                  Password (min 8 chars)
                </label>
                <div className="relative">
                  <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9EACC2]" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#080F1E] border border-[#24344B] text-xs text-[#F1F5FF] placeholder-[#9EACC2]/40 focus:outline-none focus:border-[#287FE9]"
                  />
                </div>
              </div>

              <div className="pt-1 flex flex-col space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 rounded-md bg-[#287FE9] hover:bg-[#2069c2] text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>{tab === 'login' ? 'Authenticate Session' : 'Create & Sign In'}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleQuickAnalyst}
                  disabled={loading}
                  className="w-full py-1.5 rounded-md bg-[#111E32] hover:bg-[#15253F] border border-[#24344B] text-[#9EACC2] hover:text-[#F1F5FF] text-[11px] font-mono flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                >
                  <span>1-Click Auto-Provision Analyst</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-[#24344B] text-[10px] text-[#9EACC2] flex items-center justify-between font-mono">
          <span>JWT Auth Protocol: Bearer</span>
          <span>RFC 7519 Compliant</span>
        </div>
      </div>
    </div>
  )
}
