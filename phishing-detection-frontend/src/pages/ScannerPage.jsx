import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Shield,
  Loader2,
  Globe,
  Lock,
  Cpu,
  Database,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Terminal,
  ArrowRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import Sidebar from '../components/dashboard/Sidebar'
import TopNavbar from '../components/dashboard/TopNavbar'
import Squares from '../components/backgrounds/Squares'
import { isValidUrl } from '../utils/simulateScan'
import { scanUrl } from '../services/scanService'
import { isApiMode, getApiBaseUrl } from '../services/api'

const SCAN_STAGES = [
  {
    title: 'URL Scheme & SSRF Boundary Normalization',
    desc: 'Validating RFC compliance, parsing destination hostname, and verifying non-routable private subnets.',
    icon: Globe,
  },
  {
    title: '18-Feature Lexical & Entropy Analysis',
    desc: 'Extracting Shannon entropy, brand lure keywords, subdomain stacking depth, and punycode flags.',
    icon: Cpu,
  },
  {
    title: 'Passive HTTP Security Headers Audit',
    desc: 'Auditing Strict-Transport-Security, CSP policies, X-Frame-Options, and hop-by-hop redirects.',
    icon: Shield,
  },
  {
    title: 'Cryptographic TLS & Certificate Check',
    desc: 'Verifying Subject Alternative Names (SAN), issuer trust root, expiration, and CT logs.',
    icon: Lock,
  },
  {
    title: 'Multi-Feed Threat Intelligence Correlation',
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
  const [scanError, setScanError] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [currentStage, setCurrentStage] = useState(0)
  const initialScannedRef = useRef(false)

  const performScan = async (urlToScan) => {
    const trimmed = (urlToScan || '').trim()

    if (!trimmed) {
      setUrlError('Please enter a target URL or domain to evaluate.')
      return
    }

    const validation = isValidUrl(trimmed)
    if (!validation.valid) {
      setUrlError(validation.error || 'Please enter a valid HTTP or HTTPS URL (e.g., https://example.com).')
      return
    }

    setUrlError(null)
    setScanError(null)
    setIsScanning(true)
    setCurrentStage(0)

    // Stage progression visualization
    let stage = 0
    const interval = setInterval(() => {
      stage += 1
      if (stage < SCAN_STAGES.length) {
        setCurrentStage(stage)
      }
    }, 400)

    try {
      await scanUrl(trimmed)
      clearInterval(interval)
      setCurrentStage(SCAN_STAGES.length - 1)
      setIsScanning(false)

      // Navigate to results
      setTimeout(() => {
        navigate('/results')
      }, 550)
    } catch (err) {
      clearInterval(interval)
      setIsScanning(false)
      setScanError(err.message || 'Scan request failed. Please verify API configuration or try again.')
    }
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

  const samplePresets = [
    { label: 'PayPal Spoof (Phish)', url: 'http://paypal.com.account-verification-notice.xyz/login.html' },
    { label: 'Bare IP Host (Suspicious)', url: 'http://185.220.101.4:8080/apple/id/verification' },
    { label: 'GitHub Linux (Legitimate)', url: 'https://github.com/torvalds/linux' },
    { label: 'Cloud Storage (Phish Lure)', url: 'https://cloud-storage-temporary-share-98.top/dl' },
  ]

  return (
    <div className="min-h-screen bg-[#080F1E] light:bg-[#F5F7FC] text-[#F1F5FF] light:text-[#172033] transition-colors duration-200 flex relative overflow-hidden">
      {/* Restrained Technical Grid Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <Squares
          direction="diagonal"
          speed={0.15}
          squareSize={48}
          borderColor="rgba(36, 52, 75, 0.35)"
          hoverFillColor="rgba(40, 127, 233, 0.08)"
          className="opacity-40 dark:opacity-60"
        />
        <div className="absolute inset-0 bg-[#080F1E]/70 light:bg-[#F5F7FC]/80 pointer-events-none"></div>
      </div>

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${collapsed ? 'ml-0 md:ml-18' : 'ml-0 md:ml-60'}`}>
        <TopNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl w-full mx-auto">
          {/* Header Title */}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#287FE9]">
                TARGET INGESTION
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5FF] light:text-[#172033] mt-0.5">
              URL & Phishing Security Scanner
            </h1>
            <p className="text-xs text-[#9EACC2] light:text-[#64748B] mt-0.5">
              Submit target web resource for explainable multi-pillar threat evaluation across lexical, cryptographic, and threat feed vectors.
            </p>
          </div>

          {/* Mode & Demonstration Notice Banner */}
          <div className="p-3 rounded-md bg-[#0D1728] light:bg-amber-50 border border-[#24344B] light:border-amber-200 text-xs text-[#9EACC2] light:text-amber-900 flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong className="text-[#F1F5FF] light:text-amber-950 font-semibold font-mono">
                  {isApiMode() ? 'BACKEND API MODE:' : 'DEMONSTRATION MODE:'}
                </strong>{' '}
                {isApiMode()
                  ? `Telemetry dispatched to ${getApiBaseUrl()}. Real-time scans and ML heuristics are evaluated by backend service.`
                  : 'All telemetry, risk scores, and detections are computed client-side for UI/UX demonstration. No active malicious probes are transmitted.'}
              </span>
            </div>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#111E32] light:bg-amber-100 text-[#9EACC2] light:text-amber-800 border border-[#24344B] light:border-amber-200 whitespace-nowrap">
              {isApiMode() ? 'API Node' : 'Mock Heuristics'}
            </span>
          </div>

          {/* Scan Error Banner with Retry */}
          {scanError && (
            <div className="p-3.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span><strong>Scan Error:</strong> {scanError}</span>
              </div>
              <button
                type="button"
                onClick={() => performScan(targetUrl)}
                className="self-end sm:self-auto px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Primary URL Input Card */}
          <div className="cyber-card p-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#9EACC2] light:text-[#64748B]">
                  Target Uniform Resource Locator (URL)
                </label>
                <span className="text-[11px] font-mono text-[#9EACC2] light:text-[#64748B]">
                  RFC 3986 Syntax Normalizer
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9EACC2]" />
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => {
                      setTargetUrl(e.target.value)
                      if (urlError) setUrlError(null)
                    }}
                    placeholder="https://example.com or http://target-domain.xyz/auth/verify..."
                    disabled={isScanning}
                    className={`w-full pl-10 pr-16 py-2.5 rounded-md text-xs font-mono bg-[#0B1629] light:bg-slate-50 border ${
                      urlError
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-[#24344B] light:border-[#E2E8F0] focus:border-[#287FE9]'
                    } text-[#F1F5FF] light:text-[#172033] placeholder-[#9EACC2]/60 focus:outline-none transition-colors`}
                  />
                  {targetUrl && !isScanning && (
                    <button
                      type="button"
                      onClick={() => setTargetUrl('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-[#9EACC2] hover:text-[#F1F5FF] light:hover:text-[#172033] px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isScanning || !targetUrl.trim()}
                  className="cyber-btn-primary text-xs font-semibold py-2.5 px-5 whitespace-nowrap shrink-0 space-x-1.5"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Auditing Host...</span>
                    </>
                  ) : (
                    <>
                      <span>Execute Inspection</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {urlError && (
                <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{urlError}</span>
                </div>
              )}
            </form>

            {/* Test Presets */}
            <div className="mt-4 pt-3.5 border-t border-[#24344B] light:border-[#E2E8F0]">
              <span className="text-[11px] font-mono text-[#9EACC2] light:text-[#64748B] block mb-2">
                Demonstration Attack Vectors:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {samplePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTargetUrl(preset.url)
                      if (urlError) setUrlError(null)
                    }}
                    className="p-2 rounded bg-[#0D1728] light:bg-slate-50 hover:bg-[#15253F] light:hover:bg-slate-100 border border-[#24344B] light:border-[#E2E8F0] text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-[11px] font-mono font-semibold text-[#F1F5FF] light:text-[#172033] group-hover:text-[#287FE9]">
                      {preset.label}
                    </div>
                    <div className="text-[10px] font-mono text-[#9EACC2] light:text-[#64748B] truncate mt-0.5">
                      {preset.url}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scanning Progress Stage Timeline */}
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="cyber-card p-5 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#24344B] light:border-[#E2E8F0]">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-[#287FE9] animate-spin" />
                  <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-[#F1F5FF] light:text-[#172033]">
                    Multi-Pillar Triage In Progress (Stage {currentStage + 1} of {SCAN_STAGES.length})
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#287FE9] font-bold">
                  {Math.round(((currentStage + 1) / SCAN_STAGES.length) * 100)}%
                </span>
              </div>

              <div className="space-y-2">
                {SCAN_STAGES.map((stage, idx) => {
                  const Icon = stage.icon
                  const isDone = idx < currentStage
                  const isCurrent = idx === currentStage

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-md border text-xs transition-colors ${
                        isCurrent
                          ? 'bg-[#111E32] light:bg-blue-50/60 border-[#287FE9]/60'
                          : isDone
                          ? 'bg-[#0D1728] light:bg-slate-50 border-[#24344B] light:border-[#E2E8F0] opacity-80'
                          : 'bg-[#080F1E] light:bg-white border-[#24344B]/40 light:border-slate-200 opacity-40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5 font-mono">
                          <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#287FE9]' : isDone ? 'text-emerald-400' : 'text-[#9EACC2]'}`} />
                          <span className={`font-semibold ${isCurrent ? 'text-[#F1F5FF] light:text-[#172033]' : 'text-[#9EACC2]'}`}>
                            {stage.title}
                          </span>
                        </div>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : isCurrent ? (
                          <Loader2 className="w-3.5 h-3.5 text-[#287FE9] animate-spin" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#24344B]"></span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-[#9EACC2] light:text-[#64748B] pl-6 leading-relaxed">
                        {stage.desc}
                      </p>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Engine Explanation Architecture Card */}
          <div className="cyber-panel-secondary p-4 text-xs font-mono text-[#9EACC2] light:text-[#64748B]">
            <span className="text-[#F1F5FF] light:text-[#172033] font-semibold block mb-1">
              Methodology & Technical Safeguards
            </span>
            Target URLs are validated against private non-routable IPv4/IPv6 address blocks (RFC 1918, RFC 4193) prior to socket-level handshake simulation. All heuristic evaluations, Shannon entropy calculations, and SSL/TLS certificate transparency lookups operate passively without executing untrusted scripts or browser payloads.
          </div>
        </main>
      </div>
    </div>
  )
}
