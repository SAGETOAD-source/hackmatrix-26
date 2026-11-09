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
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
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

      setTimeout(() => {
        navigate('/results')
      }, 500)
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
    <div className="min-h-screen bg-[#101C22] light:bg-[#E0F2ED] text-[#F5F7F6] light:text-[#101C22] transition-colors duration-200 flex relative overflow-hidden">
      {/* Technical Grid Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <Squares
          direction="diagonal"
          speed={0.15}
          squareSize={48}
          borderColor="rgba(85, 185, 173, 0.25)"
          hoverFillColor="rgba(22, 125, 131, 0.15)"
          className="opacity-90 dark:opacity-95"
        />
        <div className="absolute inset-0 bg-[#101C22]/30 light:bg-[#E0F2ED]/40 pointer-events-none"></div>
      </div>

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${collapsed ? 'ml-0 md:ml-18' : 'ml-0 md:ml-60'}`}>
        <TopNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl w-full mx-auto">
          {/* Header Title */}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#55B9AD]">
                TARGET INGESTION
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7F6] light:text-[#101C22] mt-0.5">
              URL & Phishing Threat Scanner
            </h1>
            <p className="text-xs text-[#A4B8B5] light:text-[#4B6B67] mt-1">
              Submit target web resource for explainable multi-pillar threat evaluation across lexical, cryptographic, and threat feed vectors.
            </p>
          </div>

          {/* Mode & Operational Notice Banner */}
          <div className="p-4 rounded-xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] text-xs text-[#A4B8B5] light:text-[#4B6B67] flex items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start sm:items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-[#E9B65B] shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong className="text-[#F5F7F6] light:text-[#101C22] font-semibold font-mono">
                  {isApiMode() ? 'BACKEND PIPELINE ACTIVE:' : 'DEMONSTRATION ENGINE:'}
                </strong>{' '}
                {isApiMode()
                  ? `Telemetry dispatched to ${getApiBaseUrl()}. Real-time scans and ML heuristics are evaluated by backend service.`
                  : 'All telemetry, risk scores, and detections are computed client-side for demonstration. No untrusted payloads executed.'}
              </span>
            </div>
            <Badge verdict={isApiMode() ? 'safe' : 'suspicious'} size="sm">
              {isApiMode() ? 'Live Node' : 'Simulated'}
            </Badge>
          </div>

          {/* Scan Error Banner with Retry */}
          {scanError && (
            <div className="p-4 rounded-xl bg-[#EF6464]/10 border border-[#EF6464]/30 text-[#EF6464] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span><strong>Scan Error:</strong> {scanError}</span>
              </div>
              <button
                type="button"
                onClick={() => performScan(targetUrl)}
                className="self-end sm:self-auto px-3 py-1.5 rounded-lg bg-[#EF6464] hover:bg-[#EF6464]/90 text-white font-semibold text-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry Inspection</span>
              </button>
            </div>
          )}

          {/* Primary URL Input Card */}
          <div className="p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-md relative overflow-hidden">
            {isScanning && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#55B9AD] to-transparent animate-pulse"></div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A4B8B5] light:text-[#4B6B67]">
                  Target Uniform Resource Locator (URL)
                </label>
                <span className="text-[11px] font-mono text-[#A4B8B5] light:text-[#4B6B67]">
                  RFC 3986 Syntax Normalizer
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1 group">
                  <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4B8B5] group-focus-within:text-[#55B9AD] transition-colors" />
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => {
                      setTargetUrl(e.target.value)
                      if (urlError) setUrlError(null)
                    }}
                    placeholder="https://example.com or http://target-domain.xyz/auth/verify..."
                    disabled={isScanning}
                    className={`w-full pl-10 pr-16 py-2.5 rounded-xl text-xs font-mono bg-[#101C22] light:bg-[#E0F2ED] border ${
                      urlError
                        ? 'border-[#EF6464] focus:ring-1 focus:ring-[#EF6464]'
                        : 'border-[#24454C] light:border-[#C2E2DA] focus:border-[#167D83] focus:ring-2 focus:ring-[#167D83]/20'
                    } text-[#F5F7F6] light:text-[#101C22] placeholder-[#A4B8B5]/60 focus:outline-none transition-all`}
                  />
                  {targetUrl && !isScanning && (
                    <button
                      type="button"
                      onClick={() => setTargetUrl('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-[#A4B8B5] hover:text-[#F5F7F6] light:hover:text-[#101C22] px-2 py-0.5 rounded cursor-pointer"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isScanning || !targetUrl.trim()}
                  variant="primary"
                  size="md"
                  className="whitespace-nowrap shrink-0"
                  icon={isScanning ? Loader2 : ArrowRight}
                >
                  {isScanning ? 'Auditing Host...' : 'Execute Inspection'}
                </Button>
              </div>

              {urlError && (
                <div className="flex items-center space-x-1.5 text-xs text-[#EF6464] font-mono">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{urlError}</span>
                </div>
              )}
            </form>

            {/* Test Presets */}
            <div className="mt-5 pt-4 border-t border-[#24454C] light:border-[#C2E2DA]">
              <span className="text-[11px] font-mono text-[#A4B8B5] light:text-[#4B6B67] block mb-2.5">
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
                    className="p-2.5 rounded-xl bg-[#101C22] light:bg-[#E0F2ED] hover:bg-[#1E4047] light:hover:bg-[#D1EBE5] border border-[#24454C] light:border-[#C2E2DA] text-left transition-all cursor-pointer group"
                  >
                    <div className="text-[11px] font-mono font-semibold text-[#F5F7F6] light:text-[#101C22] group-hover:text-[#55B9AD] light:group-hover:text-[#167D83]">
                      {preset.label}
                    </div>
                    <div className="text-[10px] font-mono text-[#A4B8B5] light:text-[#4B6B67] truncate mt-0.5">
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
              className="p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-md space-y-4"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-[#24454C] light:border-[#C2E2DA]">
                <div className="flex items-center space-x-2.5">
                  <Loader2 className="w-4 h-4 text-[#55B9AD] light:text-[#11786D] animate-spin" />
                  <h3 className="font-heading font-bold text-xs uppercase tracking-wider font-mono text-[#F5F7F6] light:text-[#101C22]">
                    Multi-Pillar Triage In Progress (Stage {currentStage + 1} of {SCAN_STAGES.length})
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#55B9AD] light:text-[#11786D] font-bold">
                  {Math.round(((currentStage + 1) / SCAN_STAGES.length) * 100)}%
                </span>
              </div>

              {/* Progress Bar with Ultraviolet glow */}
              <div className="w-full h-1.5 rounded-full bg-[#101C22] light:bg-[#D1EBE5] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#167D83] to-[#55B9AD] transition-all duration-300"
                  style={{ width: `${Math.round(((currentStage + 1) / SCAN_STAGES.length) * 100)}%` }}
                ></div>
              </div>

              <div className="space-y-2.5 pt-2">
                {SCAN_STAGES.map((stage, idx) => {
                  const Icon = stage.icon
                  const isDone = idx < currentStage
                  const isCurrent = idx === currentStage

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border text-xs transition-all ${
                        isCurrent
                          ? 'bg-[#167D83]/15 light:bg-[#167D83]/10 border-[#167D83]/50 shadow-xs'
                          : isDone
                          ? 'bg-[#101C22] light:bg-[#E0F2ED] border-[#24454C] light:border-[#C2E2DA] opacity-90'
                          : 'bg-[#101C22]/40 light:bg-white border-[#24454C]/40 light:border-slate-200 opacity-40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5 font-mono">
                          <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#55B9AD] light:text-[#11786D]' : isDone ? 'text-[#55B9AD]' : 'text-[#A4B8B5]'}`} />
                          <span className={`font-semibold ${isCurrent ? 'text-[#F5F7F6] light:text-[#101C22]' : 'text-[#A4B8B5] light:text-[#4B6B67]'}`}>
                            {stage.title}
                          </span>
                        </div>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#55B9AD]" />
                        ) : isCurrent ? (
                          <Loader2 className="w-3.5 h-3.5 text-[#55B9AD] light:text-[#11786D] animate-spin" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#24454C]"></span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-[#A4B8B5] light:text-[#4B6B67] pl-6 leading-relaxed">
                        {stage.desc}
                      </p>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Engine Explanation Architecture Card */}
          <div className="p-4 rounded-xl bg-[#101C22] light:bg-[#E0F2ED] border border-[#24454C] light:border-[#C2E2DA] text-xs font-mono text-[#A4B8B5] light:text-[#4B6B67]">
            <span className="text-[#F5F7F6] light:text-[#101C22] font-semibold block mb-1">
              Methodology & Technical Safeguards
            </span>
            Target URLs are validated against private non-routable IPv4/IPv6 address blocks (RFC 1918, RFC 4193) prior to socket-level handshake simulation. All heuristic evaluations, Shannon entropy calculations, and SSL/TLS certificate transparency lookups operate passively without executing untrusted scripts or browser payloads.
          </div>
        </main>
      </div>
    </div>
  )
}
