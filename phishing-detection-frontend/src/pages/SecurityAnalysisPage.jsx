import { useState, useId } from 'react'
import {
  Globe,
  Lock,
  Server,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldAlert,
  RefreshCw,
  Shield,
  Terminal,
  ArrowRight
} from 'lucide-react'
import Sidebar from '../components/dashboard/Sidebar'
import TopNavbar from '../components/dashboard/TopNavbar'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import CertificateStepper from '../components/ui/CertificateStepper'
import { SIMULATION_DISCLAIMER } from '../data/mockData'
import { fetchSecurityAnalysis } from '../services/securityService'
import { isApiMode, getApiBaseUrl } from '../services/api'
import { getSecurityAnalysis } from '../utils/securityAnalysisData'

/**
 * Normalizes any analysis payload (mock, live API, partial, or empty)
 * into a guaranteed safe data contract to avoid undefined property exceptions.
 */
function normalizeAnalysisPayload(data, targetFallback = 'github.com') {
  if (!data || typeof data !== 'object') {
    return {
      domain: targetFallback,
      cleanInput: targetFallback,
      isHttps: true,
      isPhish: false,
      isSuspicious: false,
      certificate: null,
      httpHeaders: [],
      dns: null,
      redirects: [],
      findings: [],
      threatIntelligenceFeed: [],
      simulatedDemo: false,
      isLiveApi: false,
      backendNotice: null,
    }
  }

  const domain = data.domain || targetFallback.replace(/^https?:\/\//, '').split('/')[0] || 'unknown'
  const isHttps = typeof data.isHttps === 'boolean' ? data.isHttps : Boolean(data.is_https)

  // Safe certificate normalization
  let cert = data.certificate || data.ssl_status || null
  if (cert && typeof cert === 'object') {
    cert = {
      ...cert,
      status: cert.status || 'Active',
      issuer: cert.issuer || 'Information Not Provided',
      subject: cert.subject || `CN=${domain}`,
      validFrom: cert.validFrom || cert.valid_from || 'N/A',
      expiryDate: cert.expiryDate || cert.expiry_date || cert.valid_to || 'N/A',
      daysRemaining: cert.daysRemaining ?? cert.days_remaining ?? 'N/A',
      keySize: cert.keySize || cert.key_size || 'N/A',
      signatureAlgorithm: cert.signatureAlgorithm || cert.signature_algorithm || '',
      validityBadge: cert.validityBadge || {
        label: cert.status || (cert.hasSSL === false ? 'No TLS' : 'Valid'),
        color: cert.hasSSL === false ? 'rose' : 'emerald',
      },
    }
  }

  // Safe HTTP headers normalization
  let headers = []
  if (Array.isArray(data.httpHeaders)) {
    headers = data.httpHeaders
  } else if (Array.isArray(data.http_headers)) {
    headers = data.http_headers
  } else if (data.httpHeaders && typeof data.httpHeaders === 'object') {
    headers = Object.entries(data.httpHeaders).map(([key, val]) => ({
      name: key,
      status: 'OBSERVED',
      statusBadge: 'OBSERVED',
      explanation: typeof val === 'string' ? val : JSON.stringify(val),
      recommendation: 'Inspect header configuration for OWASP compliance.',
    }))
  } else if (data.http_headers && typeof data.http_headers === 'object') {
    headers = Object.entries(data.http_headers).map(([key, val]) => ({
      name: key,
      status: 'OBSERVED',
      statusBadge: 'OBSERVED',
      explanation: typeof val === 'string' ? val : JSON.stringify(val),
      recommendation: 'Inspect header configuration for OWASP compliance.',
    }))
  }

  // Safe DNS normalization
  let dns = data.dns || null
  if (dns && typeof dns === 'object') {
    const aRecords = Array.isArray(dns.aRecord)
      ? dns.aRecord
      : Array.isArray(dns.aRecords)
      ? dns.aRecords
      : []

    const aaaaRecords = Array.isArray(dns.aaaaRecord)
      ? dns.aaaaRecord
      : Array.isArray(dns.aaaaRecords)
      ? dns.aaaaRecords
      : []

    const mxRecords = Array.isArray(dns.mxRecord)
      ? dns.mxRecord
      : Array.isArray(dns.mxRecords)
      ? dns.mxRecords
      : []

    const nsRecords = Array.isArray(dns.nsRecord)
      ? dns.nsRecord
      : Array.isArray(dns.nsRecords)
      ? dns.nsRecords
      : []

    dns = {
      ...dns,
      aRecord: aRecords,
      aaaaRecord: aaaaRecords,
      mxRecord: mxRecords,
      nsRecord: nsRecords,
      securityStatus: dns.securityStatus || {
        status: dns.dnssec ? 'SECURE' : 'INSECURE',
        label: dns.dnssec ? 'DNSSEC Verified' : 'DNSSEC Not Configured',
        isEvaluated: Boolean(dns.dnssec !== undefined),
      },
    }
  }

  // Safe redirects normalization
  let redirects = []
  if (Array.isArray(data.redirects)) {
    redirects = data.redirects
  } else if (Array.isArray(data.redirectChain)) {
    redirects = data.redirectChain
  } else if (Array.isArray(data.redirect_chain)) {
    redirects = data.redirect_chain
  }

  // Safe findings normalization
  let findings = []
  if (Array.isArray(data.findings)) {
    findings = data.findings
  } else if (Array.isArray(data.suspiciousIndicators)) {
    findings = data.suspiciousIndicators.map((item, idx) => ({
      id: `ind-${idx}`,
      title: item.title || 'Security Anomaly',
      severity: item.severity || 'WARN',
      description: item.description || '',
      recommendedAction: item.remediation || 'Inspect destination posture.',
    }))
  }

  return {
    domain,
    cleanInput: data.cleanInput || domain,
    isHttps,
    isPhish: Boolean(data.isPhish || data.is_phishing),
    isSuspicious: Boolean(data.isSuspicious),
    certificate: cert,
    httpHeaders: headers,
    dns,
    redirects,
    findings,
    threatIntelligenceFeed: Array.isArray(data.threatIntelligenceFeed) ? data.threatIntelligenceFeed : [],
    simulatedDemo: Boolean(data.simulatedDemo),
    isLiveApi: Boolean(data.isLiveApi),
    backendNotice: data.backendNotice || null,
  }
}

export default function SecurityAnalysisPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [targetInput, setTargetInput] = useState('github.com')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  const rawId = useId()

  const [analysisData, setAnalysisData] = useState(() => {
    try {
      const initial = getSecurityAnalysis('github.com')
      return normalizeAnalysisPayload(initial, 'github.com')
    } catch {
      return normalizeAnalysisPayload(null, 'github.com')
    }
  })

  const handleAnalyze = async (domainToAnalyze) => {
    const trimmed = (domainToAnalyze || '').trim()
    if (!trimmed) return

    setIsAnalyzing(true)
    setAnalysisError(null)

    try {
      const result = await fetchSecurityAnalysis(trimmed)
      setAnalysisData(normalizeAnalysisPayload(result, trimmed))
    } catch (err) {
      console.warn('Analysis error:', err.message)
      setAnalysisError(err.message || 'Deep security inspection probe failed.')
      const fallback = getSecurityAnalysis(trimmed)
      setAnalysisData(normalizeAnalysisPayload(fallback, trimmed))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handlePresetSelect = (presetDomain) => {
    setTargetInput(presetDomain)
    handleAnalyze(presetDomain)
  }

  const cert = analysisData?.certificate
  const dns = analysisData?.dns

  return (
    <div className="min-h-screen bg-[#0B0A14] light:bg-[#F7F5FF] text-[#F2F0FF] light:text-[#1E1B4B] transition-colors duration-200 flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ease-in-out ${
          collapsed ? 'ml-0 md:ml-18' : 'ml-0 md:ml-60'
        }`}
      >
        <TopNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl w-full mx-auto">
          {/* Header Title */}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A78BFF]">
                INFRASTRUCTURE RECONNAISSANCE
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F2F0FF] light:text-[#1E1B4B] mt-0.5">
              Security & Transport Audit Console
            </h1>
            <p className="text-xs text-[#A29FC9] light:text-[#6E6893] mt-1">
              Deep-dive inspection across cryptographic TLS certificates, passive HTTP headers, authoritative DNS records, and redirect chains.
            </p>
          </div>

          {/* Mode & Operational Notice Banner */}
          <div className="p-3.5 rounded-xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] text-xs text-[#A29FC9] light:text-[#6E6893] flex items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start sm:items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-[#FFB020] shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong className="text-[#F2F0FF] light:text-[#1E1B4B] font-semibold font-mono">
                  {analysisData?.isLiveApi ? 'LIVE BACKEND AUDIT:' : 'SIMULATED DEMONSTRATION ENGINE:'}
                </strong>{' '}
                {analysisData?.isLiveApi
                  ? `Telemetry returned live from API server (${getApiBaseUrl()}).`
                  : 'Displaying synthetic telemetry and deterministic OWASP heuristics for interface evaluation.'}
              </span>
            </div>
            <Badge verdict={analysisData?.isLiveApi ? 'safe' : 'suspicious'} size="sm">
              {analysisData?.isLiveApi ? 'Live API' : 'Simulated'}
            </Badge>
          </div>

          {/* Analysis Error Banner with Retry */}
          {analysisError && (
            <div className="p-3.5 rounded-xl bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 text-[#FF4D6D] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span><strong>Analysis Error:</strong> {analysisError}</span>
              </div>
              <button
                type="button"
                onClick={() => handleAnalyze(targetInput)}
                className="px-2.5 py-1 rounded bg-[#FF4D6D] hover:bg-[#FF4D6D]/90 text-white font-semibold text-xs flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Domain Query Bar & Sample Pickers */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-md space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAnalyze(targetInput)
              }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <div className="relative flex-1 group">
                <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A29FC9] group-focus-within:text-[#A78BFF] transition-colors" />
                <input
                  type="text"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="Enter target domain or URL (e.g. github.com, paypal.com.verify.xyz)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-mono bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA] text-[#F2F0FF] light:text-[#1E1B4B] placeholder-[#A29FC9]/60 focus:outline-none focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/20 transition-all"
                />
              </div>

              <Button
                type="submit"
                disabled={isAnalyzing || !targetInput.trim()}
                variant="primary"
                size="md"
                className="whitespace-nowrap shrink-0"
                icon={isAnalyzing ? Loader2 : Server}
              >
                {isAnalyzing ? 'Auditing Host...' : 'Audit Security Posture'}
              </Button>
            </form>

            {/* Quick Target Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#2A2650] light:border-[#E2DEFA] text-xs font-mono">
              <span className="text-[#A29FC9] light:text-[#6E6893] text-[11px] mr-1">
                Preset Hosts:
              </span>
              <button
                type="button"
                onClick={() => handlePresetSelect('github.com')}
                className="px-2.5 py-1 rounded-lg bg-[#0B0A14] light:bg-[#F7F5FF] hover:bg-[#1C1936] text-[#34E0A1] border border-[#2A2650] light:border-[#E2DEFA] transition-all cursor-pointer text-[11px]"
              >
                github.com (Clean EV/OV)
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('http://paypal.com.account-verification-notice.xyz')}
                className="px-2.5 py-1 rounded-lg bg-[#0B0A14] light:bg-[#F7F5FF] hover:bg-[#1C1936] text-[#FF4D6D] border border-[#2A2650] light:border-[#E2DEFA] transition-all cursor-pointer text-[11px]"
              >
                paypal.xyz (Phish/No TLS)
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('https://cloud-storage-temporary-share-98.top')}
                className="px-2.5 py-1 rounded-lg bg-[#0B0A14] light:bg-[#F7F5FF] hover:bg-[#1C1936] text-[#FFB020] border border-[#2A2650] light:border-[#E2DEFA] transition-all cursor-pointer text-[11px]"
              >
                cloud-storage.top (Suspicious DV)
              </button>
            </div>
          </div>

          {isAnalyzing ? (
            <div className="p-12 text-center rounded-2xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-md space-y-3 font-mono">
              <Loader2 className="w-8 h-8 text-[#C6FF3D] light:text-[#5E8F00] animate-spin mx-auto" />
              <h3 className="font-heading font-bold text-[#F2F0FF] light:text-[#1E1B4B] text-base">
                Initiating Socket Handshake Simulation...
              </h3>
              <p className="text-xs text-[#A29FC9] light:text-[#6E6893]">
                Evaluating cipher suites, DNS resource records, and security headers.
              </p>
            </div>
          ) : (
            <div key={(analysisData?.domain || 'unknown') + '-' + rawId} className="space-y-6">
              {/* 1. SSL/TLS CERTIFICATE CARD */}
              <div className="p-6 rounded-2xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-md space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A2650] light:border-[#E2DEFA] pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-[#A78BFF] flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-xs uppercase tracking-wider text-[#F2F0FF] light:text-[#1E1B4B]">
                        1. SSL/TLS Certificate Posture
                      </h2>
                      <span className="text-[11px] font-mono text-[#A29FC9] light:text-[#6E6893]">
                        Target Host: {analysisData?.domain || targetInput}
                      </span>
                    </div>
                  </div>

                  {/* Validity Badge */}
                  {cert ? (
                    <div className="flex items-center space-x-2 font-mono">
                      <Badge verdict={cert?.validityBadge?.color === 'emerald' ? 'safe' : cert?.validityBadge?.color === 'amber' ? 'suspicious' : 'malicious'} size="sm">
                        {cert?.validityBadge?.label || cert?.status || 'Active'}
                      </Badge>

                      <span className="px-2.5 py-0.5 rounded-lg bg-[#0B0A14] light:bg-[#EDE9FE] text-[#A78BFF] light:text-[#7C5CFF] text-[11px] font-bold border border-[#2A2650] light:border-[#D4CDFA]">
                        Days Left: {cert?.daysRemaining ?? 'N/A'}
                      </span>
                    </div>
                  ) : (
                    <Badge verdict="suspicious" size="sm">
                      No Certificate Telemetry
                    </Badge>
                  )}
                </div>

                {/* PKI Certificate Stepper Visual Trust Chain */}
                {cert && (
                  <div>
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#A29FC9] light:text-[#6E6893] mb-3">
                      Certificate Trust Path
                    </h4>
                    <CertificateStepper
                      rootCA="Root Authority (ISRG Root X1 / DigiCert)"
                      intermediateCA={cert.issuer || "Let's Encrypt Authority"}
                      leafDomain={analysisData?.domain || "Target Destination"}
                      validTo={cert.expiryDate}
                    />
                  </div>
                )}

                {cert ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3.5 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA]">
                      <span className="text-[10px] uppercase text-[#A29FC9] block mb-1">Status</span>
                      <span className="font-bold text-[#F2F0FF] light:text-[#1E1B4B]">{cert.status || 'Active'}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA]">
                      <span className="text-[10px] uppercase text-[#A29FC9] block mb-1">Certificate Issuer</span>
                      <span className="font-bold text-[#F2F0FF] light:text-[#1E1B4B] truncate block" title={cert.issuer}>
                        {cert.issuer || 'Information Not Provided'}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA]">
                      <span className="text-[10px] uppercase text-[#A29FC9] block mb-1">Subject Common Name</span>
                      <span className="font-bold text-[#F2F0FF] light:text-[#1E1B4B] truncate block" title={cert.subject}>
                        {cert.subject || `CN=${analysisData?.domain}`}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA]">
                      <span className="text-[10px] uppercase text-[#A29FC9] block mb-1">Valid From</span>
                      <span className="text-[#F2F0FF] light:text-[#1E1B4B]">{cert.validFrom || 'N/A'}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA]">
                      <span className="text-[10px] uppercase text-[#A29FC9] block mb-1">Expiry Horizon</span>
                      <span className="text-[#F2F0FF] light:text-[#1E1B4B]">{cert.expiryDate || 'N/A'}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA]">
                      <span className="text-[10px] uppercase text-[#A29FC9] block mb-1">Key Length & Hash</span>
                      <span className="text-[#F2F0FF] light:text-[#1E1B4B]">
                        {cert.keySize || 'N/A'} {cert.signatureAlgorithm ? `/ ${cert.signatureAlgorithm}` : ''}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA] text-xs font-mono text-[#A29FC9]">
                    No cryptographic TLS/SSL certificate parameters detected or reported for this target host.
                  </div>
                )}
              </div>

              {/* 2. HTTP SECURITY HEADERS */}
              <div className="p-6 rounded-2xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-[#2A2650] light:border-[#E2DEFA] pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-[#A78BFF] flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-xs uppercase tracking-wider text-[#F2F0FF] light:text-[#1E1B4B]">
                        2. HTTP Security Response Headers
                      </h2>
                      <span className="text-[11px] font-mono text-[#A29FC9] light:text-[#6E6893]">
                        OWASP Defensive Header Hygiene Audit
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase border bg-[#0B0A14] light:bg-[#F7F5FF] border-[#2A2650] light:border-[#E2DEFA] text-[#A29FC9]">
                    Headers Audited: {analysisData?.httpHeaders?.length || 0}
                  </span>
                </div>

                {analysisData?.httpHeaders && analysisData.httpHeaders.length > 0 ? (
                  <div className="space-y-2.5 font-mono text-xs">
                    {analysisData.httpHeaders.map((hdr, idx) => {
                      const isGood = hdr?.status === 'GOOD' || hdr?.status === 'PASS'
                      const isWarn = hdr?.status === 'WARN'

                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA] space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#F2F0FF] light:text-[#1E1B4B]">
                              {hdr?.name || `Header #${idx + 1}`}
                            </span>
                            <Badge verdict={isGood ? 'safe' : isWarn ? 'suspicious' : 'malicious'} size="sm">
                              {hdr?.statusBadge || hdr?.status || 'OBSERVED'}
                            </Badge>
                          </div>
                          {hdr?.explanation && (
                            <p className="text-[11px] text-[#A29FC9] light:text-[#6E6893] leading-relaxed">
                              {hdr.explanation}
                            </p>
                          )}
                          {hdr?.recommendation && (
                            <div className="text-[11px] text-[#A78BFF] light:text-[#7C5CFF] pt-1">
                              <span className="font-semibold">Remediation:</span> {hdr.recommendation}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA] text-xs font-mono text-[#A29FC9]">
                    No HTTP security response header records (HSTS, CSP, X-Frame-Options) were returned for this target.
                  </div>
                )}
              </div>

              {/* 3. DNS INFORMATION */}
              <div className="p-6 rounded-2xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-[#2A2650] light:border-[#E2DEFA] pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-[#A78BFF] flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-xs uppercase tracking-wider text-[#F2F0FF] light:text-[#1E1B4B]">
                        3. DNS Zone Records & Infrastructure
                      </h2>
                      <span className="text-[11px] font-mono text-[#A29FC9] light:text-[#6E6893]">
                        Authoritative Resource Records
                      </span>
                    </div>
                  </div>

                  {/* DNSSEC Status Badge with Safe Fallback */}
                  <Badge verdict={dns?.securityStatus?.status === 'SECURE' ? 'safe' : 'suspicious'} size="sm">
                    DNSSEC: {dns?.securityStatus?.label || 'Not Evaluated'}
                  </Badge>
                </div>

                {dns ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3.5 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA]">
                      <span className="text-[10px] uppercase text-[#A29FC9] block mb-1">A Record (IPv4)</span>
                      <span className="text-[#F2F0FF] light:text-[#1E1B4B] font-bold block truncate">
                        {dns.aRecord?.length > 0 ? dns.aRecord.join(', ') : 'Not Configured / None'}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA]">
                      <span className="text-[10px] uppercase text-[#A29FC9] block mb-1">AAAA Record (IPv6)</span>
                      <span className="text-[#F2F0FF] light:text-[#1E1B4B] font-bold block truncate">
                        {dns.aaaaRecord?.length > 0 ? dns.aaaaRecord.join(', ') : 'Not Configured / None'}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA]">
                      <span className="text-[10px] uppercase text-[#A29FC9] block mb-1">MX Records (Mail Exchanger)</span>
                      <span className="text-[#F2F0FF] light:text-[#1E1B4B] block truncate">
                        {dns.mxRecord?.length > 0 ? dns.mxRecord.join(', ') : 'Not Configured / None'}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA]">
                      <span className="text-[10px] uppercase text-[#A29FC9] block mb-1">Authoritative NS (Nameservers)</span>
                      <span className="text-[#F2F0FF] light:text-[#1E1B4B] block truncate">
                        {dns.nsRecord?.length > 0 ? dns.nsRecord.join(', ') : 'Not Configured / None'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA] text-xs font-mono text-[#A29FC9]">
                    No DNS zone resource records were returned for this target host.
                  </div>
                )}
              </div>

              {/* 4. REDIRECT CHAIN & TRAJECTORY */}
              <div className="p-6 rounded-2xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-[#2A2650] light:border-[#E2DEFA] pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-[#A78BFF] flex items-center justify-center">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-xs uppercase tracking-wider text-[#F2F0FF] light:text-[#1E1B4B]">
                        4. Redirect Chain & Hop Trajectory
                      </h2>
                      <span className="text-[11px] font-mono text-[#A29FC9] light:text-[#6E6893]">
                        HTTP Status Hop Trajectory
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase border bg-[#0B0A14] light:bg-[#F7F5FF] border-[#2A2650] light:border-[#E2DEFA] text-[#A29FC9]">
                    Hops: {analysisData?.redirects?.length || 0}
                  </span>
                </div>

                {analysisData?.redirects && analysisData.redirects.length > 0 ? (
                  <div className="space-y-2 text-xs font-mono">
                    {analysisData.redirects.map((hop, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA] flex items-center justify-between">
                        <span className="text-[#F2F0FF] light:text-[#1E1B4B] truncate max-w-md">
                          {typeof hop === 'string' ? hop : hop.url || `Hop ${idx + 1}`}
                        </span>
                        <span className="text-[#A78BFF] light:text-[#7C5CFF] font-bold">
                          {typeof hop === 'object' && hop.statusCode ? hop.statusCode : '301 / 302'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA] text-xs font-mono text-[#A29FC9]">
                    Direct connection established (0 intermediate hops) or redirect trajectory was not reported by host probes.
                  </div>
                )}
              </div>

              {/* 5. SECURITY FINDINGS */}
              <div className="p-6 rounded-2xl bg-[#14122A] light:bg-white border border-[#2A2650] light:border-[#E2DEFA] shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-[#2A2650] light:border-[#E2DEFA] pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-[#A78BFF] flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-xs uppercase tracking-wider text-[#F2F0FF] light:text-[#1E1B4B]">
                        5. Security Findings & Technical Recommendations
                      </h2>
                      <span className="text-[11px] font-mono text-[#A29FC9] light:text-[#6E6893]">
                        Prioritized Defensive Remediation Matrix
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase border bg-[#0B0A14] light:bg-[#F7F5FF] border-[#2A2650] light:border-[#E2DEFA] text-[#A29FC9]">
                    Findings: {analysisData?.findings?.length || 0}
                  </span>
                </div>

                {analysisData?.findings && analysisData.findings.length > 0 ? (
                  <div className="space-y-3 font-mono text-xs">
                    {analysisData.findings.map((finding, idx) => {
                      const isCrit = finding?.severity === 'CRITICAL' || finding?.severity === 'HIGH'
                      const isWarn = finding?.severity === 'MEDIUM' || finding?.severity === 'WARN'
                      const verdict = isCrit ? 'malicious' : isWarn ? 'suspicious' : 'safe'

                      return (
                        <div
                          key={finding?.id || idx}
                          className="p-4 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA] space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#F2F0FF] light:text-[#1E1B4B]">
                              {finding?.title || 'Security Finding'}
                            </span>
                            <Badge verdict={verdict} size="sm">
                              {finding?.severity || 'INFORMATIONAL'}
                            </Badge>
                          </div>
                          {finding?.description && (
                            <p className="text-[11px] text-[#A29FC9] light:text-[#6E6893] leading-relaxed">
                              {finding.description}
                            </p>
                          )}
                          {finding?.recommendedAction && (
                            <div className="text-[11px] text-[#34E0A1] light:text-[#059669] pt-1">
                              <span className="font-semibold">Recommended Fix:</span> {finding.recommendedAction}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#0B0A14] light:bg-[#F7F5FF] border border-[#2A2650] light:border-[#E2DEFA] text-xs font-mono text-[#A29FC9]">
                    No active vulnerabilities, TLS anomalies, or critical findings detected for this host.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Demonstration Notice Footer */}
          <div className="p-2 text-center text-[11px] font-mono text-[#A29FC9] light:text-[#6E6893] italic">
            {SIMULATION_DISCLAIMER}
          </div>
        </main>
      </div>
    </div>
  )
}
