import { useState, useId } from 'react'
import {
  Globe,
  Lock,
  Server,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
  Info,
  RefreshCw,
  Shield
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'ml-0 md:ml-20' : 'ml-0 md:ml-64'}`}>
        <TopNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl w-full mx-auto">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#287FE9]/10 text-[#55B7FF] light:text-[#2563EB] border border-[#287FE9]/30 text-xs font-semibold mb-2">
                <Shield className="w-3.5 h-3.5" />
                <span>Cryptographic & Infrastructure Telemetry</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F1F5FF] light:text-[#172033]">
                Website Security & TLS Analysis
              </h1>
              <p className="text-xs sm:text-sm text-[#9EACC2] light:text-[#64748B] mt-1 max-w-2xl">
                Auditing transport cryptography, HTTP response header hygiene, DNS zone posture, and defensive configurations.
              </p>
            </div>
          </div>

          {/* Mode & Demonstration Notice Banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 light:text-amber-800 flex items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center space-x-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-bold">
                  {isApiMode() ? 'Live Backend Security Probe Mode:' : 'Simulated Demonstration Mode:'}
                </span>{' '}
                {isApiMode()
                  ? `Active target API: ${getApiBaseUrl()}. TLS certificates, DNS zone information, and HTTP headers are evaluated via backend security probes.`
                  : 'All certificate chains, DNS zone records, and HTTP header audits are simulated client-side for demonstration and architectural inspection.'}
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#111E32] light:bg-slate-200 text-[#9EACC2] light:text-slate-800 border border-[#1C2D4A] light:border-slate-300 whitespace-nowrap">
              {isApiMode() ? 'API Mode' : 'Mock Mode'}
            </span>
          </div>

          {/* Analysis Error Banner with Retry */}
          {analysisError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Analysis Error:</strong> {analysisError}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleAnalyze(targetInput)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Domain Query Bar & Sample Pickers */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] shadow-xl space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAnalyze(targetInput)
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9EACC2]" />
                <input
                  type="text"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="Enter target domain or URL (e.g. github.com, paypal.com.verify-user.xyz)..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-mono bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] text-[#F1F5FF] light:text-[#172033] placeholder-[#9EACC2]/60 focus:outline-none focus:border-[#287FE9] focus:ring-1 focus:ring-[#287FE9]"
                />
              </div>

              <button
                type="submit"
                disabled={isAnalyzing || !targetInput.trim()}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#287FE9] via-[#1E6FD6] to-[#287FE9] hover:from-[#378DF0] hover:to-[#256FD0] shadow-lg shadow-[#287FE9]/25 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Auditing Host...</span>
                  </>
                ) : (
                  <>
                    <Server className="w-4 h-4" />
                    <span>Analyze Security Posture</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Target Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1C2D4A] light:border-[#E2E8F0] text-xs">
              <span className="text-[#9EACC2] light:text-[#64748B] font-semibold text-[11px]">
                Demo Target Samples:
              </span>
              <button
                type="button"
                onClick={() => handlePresetSelect('github.com')}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer font-medium"
              >
                github.com (Clean EV/OV)
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('http://paypal.com.account-verification-notice.xyz')}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer font-medium"
              >
                paypal.xyz lure (Insecure HTTP & Phish)
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('https://cloud-storage-temporary-share-98.top')}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all cursor-pointer font-medium"
              >
                cloud-storage.top (Suspicious / DV Only)
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-16 text-center rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] space-y-3"
              >
                <Loader2 className="w-8 h-8 text-[#55B7FF] animate-spin mx-auto" />
                <h3 className="font-bold text-[#F1F5FF] light:text-[#172033] text-base">
                  Connecting to Passive Security Probe...
                </h3>
                <p className="text-xs text-[#9EACC2] light:text-[#64748B]">
                  Simulating TLS handshake, DNS zone resolution, and header hygiene parsing.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={analysisData.domain + '-' + rawId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* 1. SSL/TLS CERTIFICATE CARD */}
                <div className="p-6 rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] shadow-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C2D4A] light:border-[#E2E8F0] pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#287FE9]/10 text-[#55B7FF] flex items-center justify-center">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-base text-[#F1F5FF] light:text-[#172033]">
                          1. SSL/TLS Certificate Posture
                        </h2>
                        <span className="text-xs text-[#9EACC2] light:text-[#64748B] font-mono">
                          Target Host: {analysisData.domain}
                        </span>
                      </div>
                    </div>

                    {/* Validity Badge */}
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          cert.validityBadge.color === 'emerald'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : cert.validityBadge.color === 'amber'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {cert.validityBadge.color === 'emerald' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{cert.validityBadge.label}</span>
                      </span>

                      <span className="px-2.5 py-1 rounded-lg bg-[#287FE9]/10 text-[#55B7FF] text-xs font-bold border border-[#287FE9]/20">
                        Grade {cert.grade}
                      </span>
                    </div>
                  </div>

                  {/* Certificate Attributes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] space-y-1">
                      <span className="text-[11px] font-semibold text-[#9EACC2] light:text-[#64748B] block uppercase tracking-wider">
                        Certificate Status
                      </span>
                      <span className={`font-bold text-sm block ${cert.hasSSL ? 'text-[#F1F5FF] light:text-[#172033]' : 'text-rose-400'}`}>
                        {cert.status}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] space-y-1">
                      <span className="text-[11px] font-semibold text-[#9EACC2] light:text-[#64748B] block uppercase tracking-wider">
                        Issuer (Certificate Authority)
                      </span>
                      <span className="font-semibold text-[#F1F5FF] light:text-[#172033] block truncate" title={cert.issuer}>
                        {cert.issuer}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] space-y-1">
                      <span className="text-[11px] font-semibold text-[#9EACC2] light:text-[#64748B] block uppercase tracking-wider">
                        Subject Distinguished Name
                      </span>
                      <span className="font-semibold text-[#F1F5FF] light:text-[#172033] block truncate font-mono" title={cert.subject}>
                        {cert.subject}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] space-y-1">
                      <span className="text-[11px] font-semibold text-[#9EACC2] light:text-[#64748B] block uppercase tracking-wider flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-[#55B7FF]" />
                        <span>Valid From</span>
                      </span>
                      <span className="font-semibold text-[#F1F5FF] light:text-[#172033] block">
                        {cert.validFrom}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] space-y-1">
                      <span className="text-[11px] font-semibold text-[#9EACC2] light:text-[#64748B] block uppercase tracking-wider flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-[#55B7FF]" />
                        <span>Expiry Date</span>
                      </span>
                      <span className="font-semibold text-[#F1F5FF] light:text-[#172033] block">
                        {cert.expiryDate}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] space-y-1">
                      <span className="text-[11px] font-semibold text-[#9EACC2] light:text-[#64748B] block uppercase tracking-wider">
                        Days Remaining
                      </span>
                      <span
                        className={`font-bold text-sm block ${
                          cert.daysRemaining > 60
                            ? 'text-emerald-400'
                            : cert.daysRemaining > 0
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {cert.daysRemaining > 0
                          ? `${cert.daysRemaining} days remaining`
                          : cert.hasSSL
                          ? `Expired (${Math.abs(cert.daysRemaining)} days ago)`
                          : '0 days (No SSL)'}
                      </span>
                    </div>
                  </div>

                  {/* Cryptographic Parameters Sub-Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] text-xs">
                    <div>
                      <span className="text-[#9EACC2] block text-[11px]">Negotiated Protocol:</span>
                      <span className="font-mono font-semibold text-[#F1F5FF] light:text-[#172033]">{cert.protocol}</span>
                    </div>
                    <div>
                      <span className="text-[#9EACC2] block text-[11px]">Public Key & Size:</span>
                      <span className="font-mono font-semibold text-[#F1F5FF] light:text-[#172033]">{cert.keySize}</span>
                    </div>
                    <div>
                      <span className="text-[#9EACC2] block text-[11px]">Active Cipher Suite:</span>
                      <span className="font-mono font-semibold text-[#F1F5FF] light:text-[#172033] truncate block" title={cert.cipherSuite}>
                        {cert.cipherSuite}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. HTTP SECURITY HEADERS */}
                <div className="p-6 rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1C2D4A] light:border-[#E2E8F0] pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#287FE9]/10 text-[#55B7FF] flex items-center justify-center">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-base text-[#F1F5FF] light:text-[#172033]">
                          2. Defensive HTTP Security Headers
                        </h2>
                        <span className="text-xs text-[#9EACC2] light:text-[#64748B]">
                          Mandatory security response headers evaluated against OWASP standards
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {analysisData.httpHeaders.map((hdr, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] space-y-2 text-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="font-bold text-sm text-[#F1F5FF] light:text-[#172033] flex items-center space-x-2">
                            <span>{hdr.name}</span>
                          </span>

                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto ${
                              hdr.status === 'PASS'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : hdr.status === 'WARN'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {hdr.status === 'PASS' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : hdr.status === 'WARN' ? (
                              <AlertTriangle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            <span>{hdr.status}</span>
                          </span>
                        </div>

                        {/* Current Value */}
                        <div className="p-2.5 rounded-lg bg-[#080F1E] light:bg-slate-200/70 font-mono text-[11px] text-[#F1F5FF] light:text-[#172033] break-all border border-[#1C2D4A] light:border-slate-300">
                          <span className="text-[#9EACC2] select-none mr-2">Config:</span>
                          {hdr.value}
                        </div>

                        {/* Explanation */}
                        <p className="text-[#9EACC2] light:text-[#64748B] leading-relaxed">
                          <strong className="text-[#F1F5FF] light:text-[#172033]">Explanation: </strong>
                          {hdr.explanation}
                        </p>

                        {/* Recommendation */}
                        <div className="flex items-start space-x-1.5 text-[#55B7FF] light:text-[#2563EB] font-medium">
                          <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>
                            <strong>Recommendation: </strong>
                            {hdr.recommendation}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. DNS INFORMATION */}
                <div className="p-6 rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] shadow-xl space-y-4">
                  <div className="flex items-center space-x-3 border-b border-[#1C2D4A] light:border-[#E2E8F0] pb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-[#F1F5FF] light:text-[#172033]">
                        3. DNS Routing & Security Information
                      </h2>
                      <span className="text-xs text-[#9EACC2] light:text-[#64748B]">
                        Authoritative zone resolution and DNSSEC cryptographic signature audit
                      </span>
                    </div>
                  </div>

                  {/* DNS Records Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    {/* A Record */}
                    <div className="p-4 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] space-y-1.5">
                      <span className="font-bold text-[#9EACC2] uppercase text-[11px] tracking-wider block">
                        A Records (IPv4)
                      </span>
                      <div className="space-y-1 font-mono text-[#F1F5FF] light:text-[#172033] font-semibold">
                        {dns.aRecords.map((ip, i) => (
                          <div key={i} className="truncate">{ip}</div>
                        ))}
                      </div>
                    </div>

                    {/* AAAA Record */}
                    <div className="p-4 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] space-y-1.5">
                      <span className="font-bold text-[#9EACC2] uppercase text-[11px] tracking-wider block">
                        AAAA Records (IPv6)
                      </span>
                      <div className="space-y-1 font-mono text-[#F1F5FF] light:text-[#172033] font-semibold">
                        {dns.aaaaRecords.map((ip6, i) => (
                          <div key={i} className="truncate">{ip6}</div>
                        ))}
                      </div>
                    </div>

                    {/* MX Record */}
                    <div className="p-4 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] space-y-1.5">
                      <span className="font-bold text-[#9EACC2] uppercase text-[11px] tracking-wider block">
                        MX Records (Mail Exchange)
                      </span>
                      <div className="space-y-1 font-mono text-[#F1F5FF] light:text-[#172033] text-[11px]">
                        {dns.mxRecords.map((mx, i) => (
                          <div key={i} className="truncate">{mx}</div>
                        ))}
                      </div>
                    </div>

                    {/* NS Record */}
                    <div className="p-4 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] space-y-1.5">
                      <span className="font-bold text-[#9EACC2] uppercase text-[11px] tracking-wider block">
                        NS Records (Nameservers)
                      </span>
                      <div className="space-y-1 font-mono text-[#F1F5FF] light:text-[#172033] text-[11px]">
                        {dns.nsRecords.map((ns, i) => (
                          <div key={i} className="truncate">{ns}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* DNS Security Status Bar */}
                  <div className="p-4 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] space-y-2 text-xs">
                    <span className="font-bold text-[#F1F5FF] light:text-[#172033] block">
                      DNS Zone Security Posture
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-center space-x-2">
                        {dns.dnsSecurityStatus.dnssecStatus === 'PASS' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : dns.dnsSecurityStatus.dnssecStatus === 'WARN' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className="text-[#F1F5FF] light:text-[#172033]">
                          <strong>DNSSEC: </strong> {dns.dnsSecurityStatus.dnssec}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {dns.dnsSecurityStatus.caaStatus === 'PASS' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className="text-[#F1F5FF] light:text-[#172033]">
                          <strong>CAA Policy: </strong> {dns.dnsSecurityStatus.caaRecord}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Info className="w-4 h-4 text-[#55B7FF] shrink-0" />
                        <span className="text-[#F1F5FF] light:text-[#172033]">
                          <strong>TTL Window: </strong> {dns.dnsSecurityStatus.ttl}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. SECURITY FINDINGS */}
                <div className="p-6 rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1C2D4A] light:border-[#E2E8F0] pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-base text-[#F1F5FF] light:text-[#172033]">
                          4. Correlated Security Findings & Action Items
                        </h2>
                        <span className="text-xs text-[#9EACC2] light:text-[#64748B]">
                          Prioritized vulnerabilities and operational remediation guidance
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#0B1528] light:bg-slate-100 text-[#9EACC2] light:text-[#172033] border border-[#1C2D4A] light:border-[#E2E8F0]">
                      {analysisData.findings.length} Findings
                    </span>
                  </div>

                  <div className="space-y-3">
                    {analysisData.findings.map((finding, idx) => {
                      const isCritical = finding.severity === 'CRITICAL'
                      const isHigh = finding.severity === 'HIGH'
                      const isMedium = finding.severity === 'MEDIUM'
                      const isLow = finding.severity === 'LOW'

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-sm text-[#F1F5FF] light:text-[#172033]">
                              {finding.title}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isCritical
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : isHigh
                                  ? 'bg-red-500/20 text-red-400'
                                  : isMedium
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : isLow
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              {finding.severity}
                            </span>
                          </div>

                          <p className="text-[#9EACC2] light:text-[#64748B] leading-relaxed">
                            {finding.description}
                          </p>

                          <div className="p-2.5 rounded-lg bg-[#287FE9]/10 light:bg-blue-50 border border-[#287FE9]/20 text-[#55B7FF] light:text-blue-800">
                            <strong>Recommended Action: </strong> {finding.recommendedAction}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer simulated notice */}
          <div className="p-3 text-center text-xs text-[#9EACC2] italic">
            {SIMULATION_DISCLAIMER}
          </div>
        </main>
      </div>
    </div>
  )
}
