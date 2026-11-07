import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Search,
  Shield,
  Loader2,
  Globe,
  Lock,
  Cpu,
  Database,
  AlertTriangle,
  Zap,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/dashboard/Sidebar'
import TopNavbar from '../components/dashboard/TopNavbar'
import { SIMULATION_DISCLAIMER } from '../data/mockData'
import { isValidUrl, simulateScan, EXAMPLE_URLS } from '../utils/simulateScan'
import { saveScanToHistory } from '../utils/scanStorage'

const SCAN_STAGES = [
  {
    title: 'URL & SSRF Boundary Validation',
    desc: 'Normalizing URL structure, verifying schemes, and validating non-routable private subnets.',
    icon: Globe,
  },
  {
    title: '18-Feature Lexical & Entropy Analysis',
    desc: 'Extracting Shannon entropy, brand lure keywords, subdomain stacking, and punycode flags.',
    icon: Cpu,
  },
  {
    title: 'Passive HTTP Security Headers Audit',
    desc: 'Simulating inspection of HSTS, Content-Security-Policy, X-Frame-Options, and hop redirects.',
    icon: Shield,
  },
  {
    title: 'Cryptographic TLS & Certificate Check',
    desc: 'Verifying simulated SAN hostname matching, key length, cipher suites, and CT log status.',
    icon: Lock,
  },
  {
    title: 'Threat Intelligence Multi-Feed Correlation',
    desc: 'Cross-referencing IOC databases, PhishTank lures, URLhaus feeds, and community blocklists.',
    icon: Database,
  },
]

export default function ScannerPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialUrl = searchParams.get('url') || ''

  const [collapsed, setCollapsed] = useState(false)
  const [targetUrl, setTargetUrl] = useState(initialUrl)
  const [urlError, setUrlError] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [currentStage, setCurrentStage] = useState(0)
  const [scanComplete, setScanComplete] = useState(false)
  const initialScannedRef = useRef(false)

  const performScan = (urlToScan) => {
    const trimmed = (urlToScan || '').trim()

    if (!trimmed) {
      setUrlError('Please enter a target URL to analyze.')
      return
    }

    const validation = isValidUrl(trimmed)
    if (!validation.valid) {
      setUrlError(validation.error || 'Please enter a valid HTTP or HTTPS URL (e.g., https://example.com).')
      return
    }

    setUrlError(null)
    setIsScanning(true)
    setScanComplete(false)
    setCurrentStage(0)

    // Stage progression
    let stage = 0
    const interval = setInterval(() => {
      stage += 1
      if (stage < SCAN_STAGES.length) {
        setCurrentStage(stage)
      } else {
        clearInterval(interval)
        // Generate deterministic simulation result
        const result = simulateScan(trimmed)
        try {
          sessionStorage.setItem('latest_scan_result', JSON.stringify(result))
          saveScanToHistory(result)
        } catch {
          // fallback if storage quota exceeded
        }

        setIsScanning(false)
        setScanComplete(true)

        // Navigate to results
        setTimeout(() => {
          navigate('/results')
        }, 700)
      }
    }, 450)
  }

  // Auto-scan if URL provided via query parameter
  useEffect(() => {
    if (initialUrl && !initialScannedRef.current) {
      initialScannedRef.current = true
      const timer = setTimeout(() => {
        performScan(initialUrl)
      }, 150)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl])

  const handleSubmit = (e) => {
    e.preventDefault()
    performScan(targetUrl)
  }

  const handleSelectExample = (url) => {
    setTargetUrl(url)
    setUrlError(null)
    performScan(url)
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] light:bg-[#f8fafc] text-slate-100 light:text-slate-900 transition-colors duration-200 flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'ml-0 md:ml-20' : 'ml-0 md:ml-64'}`}>
        <TopNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl w-full mx-auto">
          {/* Header Title */}
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 light:text-blue-700 border border-blue-500/30 text-xs font-semibold mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Multi-Vector Correlation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white light:text-slate-900">
              URL & Phishing Security Scanner
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 light:text-slate-500 mt-1 max-w-2xl">
              Submit any public web resource for explainable threat evaluation across lexical, cryptographic, header hygiene, and threat feed vectors.
            </p>
          </div>

          {/* Demonstration Notice Banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 light:text-amber-800 flex items-start sm:items-center space-x-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold">Frontend Demonstration Mode:</span>{' '}
              All telemetry, risk scores, and detections are computed deterministically client-side for demonstration and UI/UX evaluation. No live network probes are executed.
            </div>
          </div>

          {/* Scanner Input Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0f172a]/95 light:bg-white border border-[#1e293b] light:border-slate-200 shadow-xl shadow-black/10">
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 light:text-slate-700">
                Target Uniform Resource Locator (URL)
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => {
                      setTargetUrl(e.target.value)
                      if (urlError) setUrlError(null)
                    }}
                    placeholder="https://example.com or http://target-domain.xyz/auth/verify..."
                    disabled={isScanning}
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-mono bg-slate-900/90 light:bg-slate-50 border ${
                      urlError
                        ? 'border-rose-500/80 focus:ring-rose-500/50'
                        : 'border-slate-700/80 light:border-slate-300 focus:ring-blue-500/50'
                    } text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
                  />
                  {targetUrl && !isScanning && (
                    <button
                      type="button"
                      onClick={() => setTargetUrl('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white light:hover:text-slate-700 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isScanning || !targetUrl.trim()}
                  className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer whitespace-nowrap flex-shrink-0"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Scanning Target...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-white" />
                      <span>Scan Website</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Validation Error Message */}
              {urlError && (
                <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold pt-1">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{urlError}</span>
                </div>
              )}
            </form>

            {/* Example URLs Palette */}
            <div className="mt-8 pt-6 border-t border-slate-800 light:border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-300 light:text-slate-700 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Curated Threat & Clean Test Samples</span>
                </span>
                <span className="text-[11px] text-slate-500">Click to automatically populate & inspect</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {EXAMPLE_URLS.map((sample, idx) => {
                  const isPhish = sample.category === 'phishing'
                  const isSuspicious = sample.category === 'suspicious'

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isScanning}
                      onClick={() => handleSelectExample(sample.url)}
                      className="p-3 text-left rounded-xl bg-slate-900/60 light:bg-slate-50 hover:bg-slate-800/80 light:hover:bg-slate-100 border border-slate-800/90 light:border-slate-200/90 transition-all group flex flex-col justify-between cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-xs text-white light:text-slate-900 group-hover:text-blue-400 light:group-hover:text-blue-600 transition-colors">
                          {sample.label}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            isPhish
                              ? 'bg-rose-500/20 text-rose-400'
                              : isSuspicious
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {sample.category}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 light:text-slate-500 truncate block w-full">
                        {sample.url}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Active Scan Progression Card */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 rounded-2xl bg-[#0f172a] light:bg-white border border-blue-500/40 light:border-blue-300 shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-white light:text-slate-900">
                        Executing Deep Multi-Engine Audit
                      </h3>
                      <p className="text-xs font-mono text-slate-400 light:text-slate-500 truncate max-w-md">
                        Target: {targetUrl}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Phase {currentStage + 1} of {SCAN_STAGES.length}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 light:bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${((currentStage + 1) / SCAN_STAGES.length) * 100}%` }}
                  ></div>
                </div>

                {/* Stages List */}
                <div className="space-y-2">
                  {SCAN_STAGES.map((stage, idx) => {
                    const isPassed = idx < currentStage
                    const isCurrent = idx === currentStage
                    const StageIcon = stage.icon

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                          isCurrent
                            ? 'bg-blue-500/10 border-blue-500/40 text-white light:text-slate-900'
                            : isPassed
                            ? 'bg-slate-900/40 light:bg-slate-50 border-emerald-500/30 text-slate-300 light:text-slate-700'
                            : 'bg-slate-900/20 light:bg-slate-50/50 border-slate-800 light:border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isCurrent
                                ? 'bg-blue-500 text-white'
                                : isPassed
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isPassed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : isCurrent ? (
                              <Loader2 className="w-4 h-4 animate-spin text-white" />
                            ) : (
                              <StageIcon className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold block truncate">{stage.title}</span>
                            <span className="text-[11px] text-slate-400 light:text-slate-500 truncate block">
                              {stage.desc}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex-shrink-0 ml-2 ${
                            isCurrent
                              ? 'bg-blue-500 text-white'
                              : isPassed
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isPassed ? 'Completed' : isCurrent ? 'Analyzing' : 'Pending'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {scanComplete && !isScanning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className="font-bold">Scan analysis complete! Loading full security report...</span>
                </div>
                <ExternalLink className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer note */}
          <div className="p-3 text-center text-xs text-slate-500 italic">
            {SIMULATION_DISCLAIMER}
          </div>
        </main>
      </div>
    </div>
  )
}
