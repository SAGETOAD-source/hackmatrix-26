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
      : Array.isArray(dns.a_records)
      ? dns.a_records
      : dns.aRecord
      ? [dns.aRecord]
      : []

    const aaaaRecords = Array.isArray(dns.aaaaRecord)
      ? dns.aaaaRecord
      : Array.isArray(dns.aaaaRecords)
      ? dns.aaaaRecords
      : Array.isArray(dns.aaaa_records)
      ? dns.aaaa_records
      : dns.aaaaRecord
      ? [dns.aaaaRecord]
      : []

    const mxRecords = Array.isArray(dns.mxRecord)
      ? dns.mxRecord
      : Array.isArray(dns.mxRecords)
      ? dns.mxRecords
      : Array.isArray(dns.mx_records)
      ? dns.mx_records
      : dns.mxRecord
      ? [dns.mxRecord]
      : []

    const nsRecords = Array.isArray(dns.nsRecord)
      ? dns.nsRecord
      : Array.isArray(dns.nsRecords)
      ? dns.nsRecords
      : Array.isArray(dns.ns_records)
      ? dns.ns_records
      : dns.nsRecord
      ? [dns.nsRecord]
      : []

    const isDnssecActive =
      dns.securityStatus?.dnssec === true ||
      dns.securityStatus?.status === 'SECURE' ||
      dns.dnsSecurityStatus?.dnssecStatus === 'PASS' ||
      (typeof dns.dnsSecurityStatus?.dnssec === 'string' && /signed|active|pass/i.test(dns.dnsSecurityStatus.dnssec))

    const isDnssecEvaluated =
      dns.securityStatus !== undefined || dns.dnsSecurityStatus !== undefined

    dns = {
      ...dns,
      aRecord: aRecords,
      aaaaRecord: aaaaRecords,
      mxRecord: mxRecords,
      nsRecord: nsRecords,
      securityStatus: {
        status: isDnssecActive ? 'SECURE' : 'INSECURE',
        dnssec: isDnssecActive,
        isEvaluated: isDnssecEvaluated,
        label: isDnssecEvaluated ? (isDnssecActive ? 'Active' : 'Disabled / Unsigned') : 'Not Evaluated',
      },
    }
  }

  // Safe findings normalization
  let findings = []
  if (Array.isArray(data.findings)) {
    findings = data.findings
  } else if (Array.isArray(data.suspiciousIndicators)) {
    findings = data.suspiciousIndicators.map((ind, i) => ({
      id: `ind-${i}`,
      title: typeof ind === 'string' ? ind : ind.title || 'Security Indicator',
      severity: ind.severity || 'MEDIUM',
      description: ind.description || (typeof ind === 'string' ? ind : 'Suspicious indicator flagged during analysis.'),
      recommendedAction: ind.recommendation || ind.recommendedAction || 'Review host security configurations.',
    }))
  } else if (Array.isArray(data.suspicious_indicators)) {
    findings = data.suspicious_indicators.map((ind, i) => ({
      id: `ind-${i}`,
      title: typeof ind === 'string' ? ind : ind.title || 'Security Indicator',
      severity: ind.severity || 'MEDIUM',
      description: ind.description || (typeof ind === 'string' ? ind : 'Suspicious indicator flagged during analysis.'),
      recommendedAction: ind.recommendation || ind.recommendedAction || 'Review host security configurations.',
    }))
  }

  // Safe redirects normalization
  const redirects = Array.isArray(data.redirects)
    ? data.redirects
    : Array.isArray(data.redirectChain)
    ? data.redirectChain
    : Array.isArray(data.redirect_chain)
    ? data.redirect_chain
    : []

  return {
    domain,
    cleanInput: data.cleanInput || targetFallback,
    isHttps,
    isPhish: Boolean(data.isPhish),
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
  const [analysisData, setAnalysisData] = useState(() =>
    normalizeAnalysisPayload(getSecurityAnalysis('github.com'), 'github.com')
  )
  const rawId = useId()

  const handleAnalyze = async (inputToAnalyze) => {
    const target = (inputToAnalyze || targetInput).trim()
    if (!target) return

    setIsAnalyzing(true)
    setAnalysisError(null)
    try {
      const data = await fetchSecurityAnalysis(target)
      setAnalysisData(normalizeAnalysisPayload(data, target))
    } catch (err) {
      setAnalysisError(err.message || 'Failed to inspect security parameters for the target host.')
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
    <div className="min-h-screen bg-[#080F1E] light:bg-[#F5F7FC] text-[#F1F5FF] light:text-[#172033] transition-colors duration-200 flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${collapsed ? 'ml-0 md:ml-18' : 'ml-0 md:ml-60'}`}>
        <TopNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl w-full mx-auto">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#287FE9]">
                  INFRASTRUCTURE AUDIT
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5FF] light:text-[#172033] mt-0.5">
                Website Security & TLS Cryptography Studio
              </h1>
              <p className="text-xs text-[#9EACC2] light:text-[#64748B] mt-0.5">
                Passive inspection of transport layer cryptography, HTTP response hygiene, and DNS zone configurations.
              </p>
            </div>
          </div>

          {/* Mode & Demonstration Notice Banner */}
          <div className="p-3 rounded-md bg-[#0D1728] light:bg-amber-50 border border-[#24344B] light:border-amber-200 text-xs text-[#9EACC2] light:text-amber-900 flex items-start sm:items-center justify-between gap-3 font-mono">
            <div className="flex items-start sm:items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong className="text-[#F1F5FF] light:text-amber-950 font-semibold">
                  {isApiMode() ? 'LIVE PROBE MODE:' : 'SIMULATED DEMONSTRATION MODE:'}
                </strong>{' '}
                {isApiMode()
                  ? `Active API endpoint: ${getApiBaseUrl()}. TLS certificates and DNS records are requested via backend probes.`
                  : 'All certificate chains, DNS zone records, and HTTP header audits are simulated client-side for architecture inspection.'}
              </span>
            </div>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#111E32] light:bg-amber-100 text-[#9EACC2] light:text-amber-800 border border-[#24344B] light:border-amber-200 whitespace-nowrap">
              {isApiMode() ? 'API Node' : 'Mock Heuristics'}
            </span>
          </div>

          {/* Backend Gateway Architecture Notice */}
          {analysisData?.backendNotice && (
            <div className="p-3 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-start space-x-2 font-mono">
              <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>{analysisData.backendNotice}</span>
            </div>
          )}

          {/* Analysis Error Banner with Retry */}
          {analysisError && (
            <div className="p-3.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between gap-3 font-mono">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span><strong>Analysis Error:</strong> {analysisError}</span>
              </div>
              <button
                type="button"
                onClick={() => handleAnalyze(targetInput)}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Domain Query Bar & Sample Pickers */}
          <div className="cyber-card p-4 sm:p-5 space-y-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAnalyze(targetInput)
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <div className="relative flex-1">
                <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9EACC2]" />
                <input
                  type="text"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="Enter target domain or URL (e.g. github.com, paypal.com.verify.xyz)..."
                  className="w-full pl-10 pr-3 py-2 rounded-md text-xs font-mono bg-[#0B1629] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] text-[#F1F5FF] light:text-[#172033] placeholder-[#9EACC2]/60 focus:outline-none focus:border-[#287FE9]"
                />
              </div>

              <button
                type="submit"
                disabled={isAnalyzing || !targetInput.trim()}
                className="cyber-btn-primary text-xs font-semibold py-2 px-4 whitespace-nowrap shrink-0 space-x-1.5"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Auditing Host...</span>
                  </>
                ) : (
                  <>
                    <Server className="w-3.5 h-3.5" />
                    <span>Audit Security Posture</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Target Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#24344B] light:border-[#E2E8F0] text-xs font-mono">
              <span className="text-[#9EACC2] light:text-[#64748B] text-[11px] mr-1">
                Preset Hosts:
              </span>
              <button
                type="button"
                onClick={() => handlePresetSelect('github.com')}
                className="px-2 py-0.5 rounded bg-[#0D1728] light:bg-slate-100 hover:bg-[#15253F] light:hover:bg-slate-200 text-emerald-400 border border-[#24344B] light:border-[#E2E8F0] transition-colors cursor-pointer text-[11px]"
              >
                github.com (Clean EV/OV)
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('http://paypal.com.account-verification-notice.xyz')}
                className="px-2 py-0.5 rounded bg-[#0D1728] light:bg-slate-100 hover:bg-[#15253F] light:hover:bg-slate-200 text-rose-400 border border-[#24344B] light:border-[#E2E8F0] transition-colors cursor-pointer text-[11px]"
              >
                paypal.xyz (Phish/No TLS)
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('https://cloud-storage-temporary-share-98.top')}
                className="px-2 py-0.5 rounded bg-[#0D1728] light:bg-slate-100 hover:bg-[#15253F] light:hover:bg-slate-200 text-amber-400 border border-[#24344B] light:border-[#E2E8F0] transition-colors cursor-pointer text-[11px]"
              >
                cloud-storage.top (Suspicious DV)
              </button>
            </div>
          </div>

          {isAnalyzing ? (
            <div className="p-12 text-center rounded-lg cyber-card space-y-3 font-mono">
              <Loader2 className="w-6 h-6 text-[#287FE9] animate-spin mx-auto" />
              <h3 className="font-bold text-[#F1F5FF] light:text-[#172033] text-sm">
                Initiating Socket Handshake Simulation...
              </h3>
              <p className="text-xs text-[#9EACC2] light:text-[#64748B]">
                Evaluating cipher suites, DNS resource records, and security headers.
              </p>
            </div>
          ) : (
            <div key={(analysisData?.domain || 'unknown') + '-' + rawId} className="space-y-5">
              {/* 1. SSL/TLS CERTIFICATE CARD */}
              <div className="cyber-card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#24344B] light:border-[#E2E8F0] pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-md bg-[#0D1728] border border-[#24344B] text-[#287FE9] flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-bold text-xs uppercase tracking-wider text-[#F1F5FF] light:text-[#172033]">
                        1. SSL/TLS Certificate Posture
                      </h2>
                      <span className="text-[11px] font-mono text-[#9EACC2] light:text-[#64748B]">
                        Host: {analysisData?.domain || targetInput}
                      </span>
                    </div>
                  </div>

                  {/* Validity Badge */}
                  {cert ? (
                    <div className="flex items-center space-x-2 font-mono">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase border ${
                          cert?.validityBadge?.color === 'emerald'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : cert?.validityBadge?.color === 'amber'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {cert?.validityBadge?.color === 'emerald' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{cert?.validityBadge?.label || cert?.status || 'Active'}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded bg-[#0D1728] light:bg-slate-100 text-[#287FE9] text-[11px] font-bold border border-[#24344B] light:border-[#E2E8F0]">
                        Days Remaining: {cert?.daysRemaining ?? 'N/A'}
                      </span>
                    </div>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border bg-amber-500/10 text-amber-400 border-amber-500/25">
                      No Certificate Telemetry
                    </span>
                  )}
                </div>

                {cert ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                      <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">Status</span>
                      <span className="font-bold text-[#F1F5FF] light:text-[#172033]">{cert.status || 'Active'}</span>
                    </div>
                    <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                      <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">Certificate Issuer</span>
                      <span className="font-bold text-[#F1F5FF] light:text-[#172033] truncate block" title={cert.issuer}>
                        {cert.issuer || 'Information Not Provided'}
                      </span>
                    </div>
                    <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                      <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">Subject Common Name</span>
                      <span className="font-bold text-[#F1F5FF] light:text-[#172033] truncate block" title={cert.subject}>
                        {cert.subject || `CN=${analysisData?.domain}`}
                      </span>
                    </div>
                    <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                      <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">Valid From</span>
                      <span className="text-[#F1F5FF] light:text-[#172033]">{cert.validFrom || 'N/A'}</span>
                    </div>
                    <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                      <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">Expiry Horizon</span>
                      <span className="text-[#F1F5FF] light:text-[#172033]">{cert.expiryDate || 'N/A'}</span>
                    </div>
                    <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                      <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">Key Length & Hash</span>
                      <span className="text-[#F1F5FF] light:text-[#172033]">
                        {cert.keySize || 'N/A'} {cert.signatureAlgorithm ? `/ ${cert.signatureAlgorithm}` : ''}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-md bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] text-xs font-mono text-[#9EACC2]">
                    No cryptographic TLS/SSL certificate parameters detected or reported for this target host.
                  </div>
                )}
              </div>

              {/* 2. HTTP SECURITY HEADERS */}
              <div className="cyber-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#24344B] light:border-[#E2E8F0] pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-md bg-[#0D1728] border border-[#24344B] text-[#287FE9] flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-bold text-xs uppercase tracking-wider text-[#F1F5FF] light:text-[#172033]">
                        2. HTTP Security Response Headers
                      </h2>
                      <span className="text-[11px] font-mono text-[#9EACC2] light:text-[#64748B]">
                        OWASP Defensive Header Hygiene Audit
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border bg-[#0D1728] light:bg-slate-100 border-[#24344B] text-[#9EACC2]">
                    Headers Audited: {analysisData?.httpHeaders?.length || 0}
                  </span>
                </div>

                {analysisData?.httpHeaders && analysisData.httpHeaders.length > 0 ? (
                  <div className="space-y-2 font-mono text-xs">
                    {analysisData.httpHeaders.map((hdr, idx) => {
                      const isGood = hdr?.status === 'GOOD' || hdr?.status === 'PASS'
                      const isWarn = hdr?.status === 'WARN'

                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-md bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#F1F5FF] light:text-[#172033]">
                              {hdr?.name || `Header #${idx + 1}`}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                isGood
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                  : isWarn
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                              }`}
                            >
                              {hdr?.statusBadge || hdr?.status || 'OBSERVED'}
                            </span>
                          </div>
                          {hdr?.explanation && (
                            <p className="text-[11px] text-[#9EACC2] light:text-[#64748B] leading-relaxed">
                              {hdr.explanation}
                            </p>
                          )}
                          {hdr?.recommendation && (
                            <div className="text-[11px] text-[#287FE9] pt-1">
                              <span className="font-semibold">Remediation:</span> {hdr.recommendation}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-md bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] text-xs font-mono text-[#9EACC2]">
                    No HTTP security response header records (HSTS, CSP, X-Frame-Options) were returned for this target.
                  </div>
                )}
              </div>

              {/* 3. DNS INFORMATION */}
              <div className="cyber-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#24344B] light:border-[#E2E8F0] pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-md bg-[#0D1728] border border-[#24344B] text-[#287FE9] flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-bold text-xs uppercase tracking-wider text-[#F1F5FF] light:text-[#172033]">
                        3. DNS Zone Records & Infrastructure
                      </h2>
                      <span className="text-[11px] font-mono text-[#9EACC2] light:text-[#64748B]">
                        Authoritative Resource Records
                      </span>
                    </div>
                  </div>

                  {/* DNSSEC Status Badge with Safe Fallback */}
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      dns?.securityStatus?.status === 'SECURE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                        : dns?.securityStatus?.isEvaluated
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                        : 'bg-[#111E32] text-[#9EACC2] border-[#24344B]'
                    }`}
                  >
                    DNSSEC: {dns?.securityStatus?.label || 'Not Evaluated'}
                  </span>
                </div>

                {dns ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                      <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">A Record (IPv4)</span>
                      <span className="text-[#F1F5FF] light:text-[#172033] font-bold block truncate">
                        {dns.aRecord?.length > 0 ? dns.aRecord.join(', ') : 'Not Configured / None'}
                      </span>
                    </div>
                    <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                      <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">AAAA Record (IPv6)</span>
                      <span className="text-[#F1F5FF] light:text-[#172033] font-bold block truncate">
                        {dns.aaaaRecord?.length > 0 ? dns.aaaaRecord.join(', ') : 'Not Configured / None'}
                      </span>
                    </div>
                    <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                      <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">MX Records (Mail Exchanger)</span>
                      <span className="text-[#F1F5FF] light:text-[#172033] block truncate">
                        {dns.mxRecord?.length > 0 ? dns.mxRecord.join(', ') : 'Not Configured / None'}
                      </span>
                    </div>
                    <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                      <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">Authoritative NS (Nameservers)</span>
                      <span className="text-[#F1F5FF] light:text-[#172033] block truncate">
                        {dns.nsRecord?.length > 0 ? dns.nsRecord.join(', ') : 'Not Configured / None'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-md bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] text-xs font-mono text-[#9EACC2]">
                    No DNS zone resource records were returned for this target host.
                  </div>
                )}
              </div>

              {/* 4. REDIRECT CHAIN & TRAJECTORY */}
              <div className="cyber-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#24344B] light:border-[#E2E8F0] pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-md bg-[#0D1728] border border-[#24344B] text-[#287FE9] flex items-center justify-center">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-bold text-xs uppercase tracking-wider text-[#F1F5FF] light:text-[#172033]">
                        4. Redirect Chain & Hop Trajectory
                      </h2>
                      <span className="text-[11px] font-mono text-[#9EACC2] light:text-[#64748B]">
                        HTTP Status Hop Trajectory
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border bg-[#0D1728] light:bg-slate-100 border-[#24344B] text-[#9EACC2]">
                    Hops: {analysisData?.redirects?.length || 0}
                  </span>
                </div>

                {analysisData?.redirects && analysisData.redirects.length > 0 ? (
                  <div className="space-y-2 text-xs font-mono">
                    {analysisData.redirects.map((hop, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] flex items-center justify-between">
                        <span className="text-[#F1F5FF] light:text-[#172033] truncate max-w-md">
                          {typeof hop === 'string' ? hop : hop.url || `Hop ${idx + 1}`}
                        </span>
                        <span className="text-[#287FE9] font-bold">
                          {typeof hop === 'object' && hop.statusCode ? hop.statusCode : '301 / 302'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] text-xs font-mono text-[#9EACC2]">
                    Direct connection established (0 intermediate hops) or redirect trajectory was not reported by host probes.
                  </div>
                )}
              </div>

              {/* 5. SECURITY FINDINGS */}
              <div className="cyber-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#24344B] light:border-[#E2E8F0] pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-md bg-[#0D1728] border border-[#24344B] text-[#287FE9] flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-bold text-xs uppercase tracking-wider text-[#F1F5FF] light:text-[#172033]">
                        5. Security Findings & Technical Recommendations
                      </h2>
                      <span className="text-[11px] font-mono text-[#9EACC2] light:text-[#64748B]">
                        Prioritized Defensive Remediation Matrix
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border bg-[#0D1728] light:bg-slate-100 border-[#24344B] text-[#9EACC2]">
                    Findings: {analysisData?.findings?.length || 0}
                  </span>
                </div>

                {analysisData?.findings && analysisData.findings.length > 0 ? (
                  <div className="space-y-2.5 font-mono text-xs">
                    {analysisData.findings.map((finding, idx) => (
                      <div
                        key={finding?.id || idx}
                        className="p-3.5 rounded-md bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#F1F5FF] light:text-[#172033]">
                            {finding?.title || 'Security Finding'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              finding?.severity === 'CRITICAL' || finding?.severity === 'HIGH'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                                : finding?.severity === 'MEDIUM' || finding?.severity === 'WARN'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                                : 'bg-[#287FE9]/10 text-[#55B7FF] border-[#287FE9]/25'
                            }`}
                          >
                            {finding?.severity || 'INFORMATIONAL'} SEVERITY
                          </span>
                        </div>
                        {finding?.description && (
                          <p className="text-[11px] text-[#9EACC2] light:text-[#64748B] leading-relaxed">
                            {finding.description}
                          </p>
                        )}
                        {finding?.recommendedAction && (
                          <div className="text-[11px] text-emerald-400 light:text-emerald-700 pt-1">
                            <span className="font-semibold">Recommended Fix:</span> {finding.recommendedAction}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-md bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] text-xs font-mono text-[#9EACC2]">
                    No active vulnerabilities, TLS anomalies, or critical findings detected for this host.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Demonstration Notice Footer */}
          <div className="p-2 text-center text-[11px] font-mono text-[#9EACC2] italic">
            {SIMULATION_DISCLAIMER}
          </div>
        </main>
      </div>
    </div>
  )
}
