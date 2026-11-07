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
  Terminal
} from 'lucide-react'
import Sidebar from '../components/dashboard/Sidebar'
import TopNavbar from '../components/dashboard/TopNavbar'
import { SIMULATION_DISCLAIMER } from '../data/mockData'
import { fetchSecurityAnalysis } from '../services/securityService'
import { isApiMode, getApiBaseUrl } from '../services/api'
import { getSecurityAnalysis } from '../utils/securityAnalysisData'

export default function SecurityAnalysisPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [targetInput, setTargetInput] = useState('github.com')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  const [analysisData, setAnalysisData] = useState(() => getSecurityAnalysis('github.com'))
  const rawId = useId()

  const handleAnalyze = async (inputToAnalyze) => {
    const target = (inputToAnalyze || targetInput).trim()
    if (!target) return

    setIsAnalyzing(true)
    setAnalysisError(null)
    try {
      const data = await fetchSecurityAnalysis(target)
      setAnalysisData(data)
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

  const cert = analysisData.certificate
  const dns = analysisData.dns

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
            <div key={analysisData.domain + '-' + rawId} className="space-y-5">
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
                        Host: {analysisData.domain}
                      </span>
                    </div>
                  </div>

                  {/* Validity Badge */}
                  <div className="flex items-center space-x-2 font-mono">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase border ${
                        cert.validityBadge.color === 'emerald'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : cert.validityBadge.color === 'amber'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {cert.validityBadge.color === 'emerald' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      <span>{cert.validityBadge.label}</span>
                    </span>

                    <span className="px-2 py-0.5 rounded bg-[#0D1728] light:bg-slate-100 text-[#287FE9] text-[11px] font-bold border border-[#24344B] light:border-[#E2E8F0]">
                      Days Remaining: {cert.daysRemaining}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                    <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">Status</span>
                    <span className="font-bold text-[#F1F5FF] light:text-[#172033]">{cert.status}</span>
                  </div>
                  <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                    <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">Certificate Issuer</span>
                    <span className="font-bold text-[#F1F5FF] light:text-[#172033] truncate block" title={cert.issuer}>
                      {cert.issuer}
                    </span>
                  </div>
                  <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                    <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">Subject Common Name</span>
                    <span className="font-bold text-[#F1F5FF] light:text-[#172033] truncate block" title={cert.subject}>
                      {cert.subject}
                    </span>
                  </div>
                  <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                    <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">Valid From</span>
                    <span className="text-[#F1F5FF] light:text-[#172033]">{cert.validFrom}</span>
                  </div>
                  <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                    <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">Expiry Horizon</span>
                    <span className="text-[#F1F5FF] light:text-[#172033]">{cert.expiryDate}</span>
                  </div>
                  <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                    <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">Key Length & Hash</span>
                    <span className="text-[#F1F5FF] light:text-[#172033]">{cert.keySize} / {cert.signatureAlgorithm}</span>
                  </div>
                </div>
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
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {analysisData.httpHeaders.map((hdr, idx) => {
                    const isGood = hdr.status === 'GOOD'
                    const isWarn = hdr.status === 'WARN'

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-md bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#F1F5FF] light:text-[#172033]">
                            {hdr.name}
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
                            {hdr.statusBadge}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#9EACC2] light:text-[#64748B] leading-relaxed">
                          {hdr.explanation}
                        </p>
                        <div className="text-[11px] text-[#287FE9] pt-1">
                          <span className="font-semibold">Remediation:</span> {hdr.recommendation}
                        </div>
                      </div>
                    )
                  })}
                </div>
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
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      dns.securityStatus.status === 'SECURE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                    }`}
                  >
                    DNSSEC: {dns.securityStatus.dnssec ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                    <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">A Record (IPv4)</span>
                    <span className="text-[#F1F5FF] light:text-[#172033] font-bold block">{dns.aRecord.join(', ')}</span>
                  </div>
                  <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                    <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">AAAA Record (IPv6)</span>
                    <span className="text-[#F1F5FF] light:text-[#172033] font-bold block truncate">{dns.aaaaRecord.join(', ')}</span>
                  </div>
                  <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                    <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">MX Records (Mail Exchanger)</span>
                    <span className="text-[#F1F5FF] light:text-[#172033] block truncate">{dns.mxRecord.join(', ')}</span>
                  </div>
                  <div className="p-3 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                    <span className="text-[10px] uppercase text-[#9EACC2] block mb-1">Authoritative NS (Nameservers)</span>
                    <span className="text-[#F1F5FF] light:text-[#172033] block truncate">{dns.nsRecord.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* 4. SECURITY FINDINGS */}
              <div className="cyber-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#24344B] light:border-[#E2E8F0] pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-md bg-[#0D1728] border border-[#24344B] text-[#287FE9] flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-bold text-xs uppercase tracking-wider text-[#F1F5FF] light:text-[#172033]">
                        4. Security Findings & Technical Recommendations
                      </h2>
                      <span className="text-[11px] font-mono text-[#9EACC2] light:text-[#64748B]">
                        Prioritized Defensive Remediation Matrix
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 font-mono text-xs">
                  {analysisData.findings.map((finding) => (
                    <div
                      key={finding.id}
                      className="p-3.5 rounded-md bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#F1F5FF] light:text-[#172033]">
                          {finding.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            finding.severity === 'HIGH'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                              : finding.severity === 'MEDIUM'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                              : 'bg-[#287FE9]/10 text-[#55B7FF] border-[#287FE9]/25'
                          }`}
                        >
                          {finding.severity} SEVERITY
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9EACC2] light:text-[#64748B] leading-relaxed">
                        {finding.description}
                      </p>
                      <div className="text-[11px] text-emerald-400 light:text-emerald-700 pt-1">
                        <span className="font-semibold">Recommended Fix:</span> {finding.recommendedAction}
                      </div>
                    </div>
                  ))}
                </div>
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
