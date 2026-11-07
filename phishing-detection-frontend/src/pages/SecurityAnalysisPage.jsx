import { useState, useId } from 'react'
import {
  Globe,
  Lock,
  Shield,
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
  Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/dashboard/Sidebar'
import TopNavbar from '../components/dashboard/TopNavbar'
import { SIMULATION_DISCLAIMER } from '../data/mockData'
import { getSecurityAnalysis } from '../utils/securityAnalysisData'

export default function SecurityAnalysisPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [targetInput, setTargetInput] = useState('github.com')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisData, setAnalysisData] = useState(() => getSecurityAnalysis('github.com'))
  const rawId = useId()

  const handleAnalyze = (inputToAnalyze) => {
    const target = (inputToAnalyze || targetInput).trim()
    if (!target) return

    setIsAnalyzing(true)
    setTimeout(() => {
      setAnalysisData(getSecurityAnalysis(target))
      setIsAnalyzing(false)
    }, 400)
  }

  const handlePresetSelect = (presetDomain) => {
    setTargetInput(presetDomain)
    handleAnalyze(presetDomain)
  }

  const cert = analysisData.certificate
  const dns = analysisData.dns

  return (
    <div className="min-h-screen bg-[#0a0f1d] light:bg-[#f8fafc] text-slate-100 light:text-slate-900 transition-colors duration-200 flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'ml-0 md:ml-20' : 'ml-0 md:ml-64'}`}>
        <TopNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl w-full mx-auto">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 light:text-blue-700 border border-blue-500/30 text-xs font-semibold mb-2">
                <Shield className="w-3.5 h-3.5" />
                <span>Cryptographic & Infrastructure Telemetry</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white light:text-slate-900">
                Website Security & TLS Analysis
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 light:text-slate-500 mt-1 max-w-2xl">
                Auditing transport cryptography, HTTP response header hygiene, DNS zone posture, and defensive configurations.
              </p>
            </div>
          </div>

          {/* Demonstration Notice Banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 light:text-amber-800 flex items-start sm:items-center space-x-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold">Simulated Demonstration Mode:</span>{' '}
              All certificate chains, DNS zone records, and HTTP header audits are simulated client-side for demonstration and architectural inspection.
            </div>
          </div>

          {/* Domain Query Bar & Sample Pickers */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0f172a] light:bg-white border border-[#1e293b] light:border-slate-200 shadow-xl space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAnalyze(targetInput)
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="Enter target domain or URL (e.g. github.com, paypal.com.verify-user.xyz)..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-mono bg-slate-900/90 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={isAnalyzing || !targetInput.trim()}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer flex-shrink-0"
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
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 light:border-slate-200 text-xs">
              <span className="text-slate-400 light:text-slate-500 font-semibold text-[11px]">
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
                className="p-16 text-center rounded-2xl bg-[#0f172a] light:bg-white border border-[#1e293b] light:border-slate-200 space-y-3"
              >
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                <h3 className="font-bold text-white light:text-slate-900 text-base">
                  Connecting to Passive Security Probe...
                </h3>
                <p className="text-xs text-slate-400 light:text-slate-500">
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
                <div className="p-6 rounded-2xl bg-[#0f172a] light:bg-white border border-[#1e293b] light:border-slate-200 shadow-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 light:border-slate-200 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-base text-white light:text-slate-900">
                          1. SSL/TLS Certificate Posture
                        </h2>
                        <span className="text-xs text-slate-400 light:text-slate-500 font-mono">
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

                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                        Grade {cert.grade}
                      </span>
                    </div>
                  </div>

                  {/* Certificate Attributes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                        Certificate Status
                      </span>
                      <span className={`font-bold text-sm block ${cert.hasSSL ? 'text-white light:text-slate-900' : 'text-rose-400'}`}>
                        {cert.status}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                        Issuer (Certificate Authority)
                      </span>
                      <span className="font-semibold text-white light:text-slate-900 block truncate" title={cert.issuer}>
                        {cert.issuer}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                        Subject Distinguished Name
                      </span>
                      <span className="font-semibold text-white light:text-slate-900 block truncate font-mono" title={cert.subject}>
                        {cert.subject}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        <span>Valid From</span>
                      </span>
                      <span className="font-semibold text-white light:text-slate-900 block">
                        {cert.validFrom}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        <span>Expiry Date</span>
                      </span>
                      <span className="font-semibold text-white light:text-slate-900 block">
                        {cert.expiryDate}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-900/40 light:bg-slate-100 border border-slate-800/70 light:border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Negotiated Protocol:</span>
                      <span className="font-mono font-semibold text-white light:text-slate-900">{cert.protocol}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Public Key & Size:</span>
                      <span className="font-mono font-semibold text-white light:text-slate-900">{cert.keySize}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Active Cipher Suite:</span>
                      <span className="font-mono font-semibold text-white light:text-slate-900 truncate block" title={cert.cipherSuite}>
                        {cert.cipherSuite}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. HTTP SECURITY HEADERS */}
                <div className="p-6 rounded-2xl bg-[#0f172a] light:bg-white border border-[#1e293b] light:border-slate-200 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 light:border-slate-200 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-base text-white light:text-slate-900">
                          2. Defensive HTTP Security Headers
                        </h2>
                        <span className="text-xs text-slate-400 light:text-slate-500">
                          Mandatory security response headers evaluated against OWASP standards
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {analysisData.httpHeaders.map((hdr, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-2 text-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="font-bold text-sm text-white light:text-slate-900 flex items-center space-x-2">
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
                        <div className="p-2 rounded-lg bg-slate-950/80 light:bg-slate-200/70 font-mono text-[11px] text-slate-300 light:text-slate-800 break-all">
                          <span className="text-slate-500 select-none mr-2">Config:</span>
                          {hdr.value}
                        </div>

                        {/* Explanation */}
                        <p className="text-slate-400 light:text-slate-600 leading-relaxed">
                          <strong className="text-slate-300 light:text-slate-800">Explanation: </strong>
                          {hdr.explanation}
                        </p>

                        {/* Recommendation */}
                        <div className="flex items-start space-x-1.5 text-blue-400 light:text-blue-700 font-medium">
                          <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
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
                <div className="p-6 rounded-2xl bg-[#0f172a] light:bg-white border border-[#1e293b] light:border-slate-200 shadow-xl space-y-4">
                  <div className="flex items-center space-x-3 border-b border-slate-800/80 light:border-slate-200 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-white light:text-slate-900">
                        3. DNS Routing & Security Information
                      </h2>
                      <span className="text-xs text-slate-400 light:text-slate-500">
                        Authoritative zone resolution and DNSSEC cryptographic signature audit
                      </span>
                    </div>
                  </div>

                  {/* DNS Records Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    {/* A Record */}
                    <div className="p-4 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-400 uppercase text-[11px] tracking-wider block">
                        A Records (IPv4)
                      </span>
                      <div className="space-y-1 font-mono text-white light:text-slate-900 font-semibold">
                        {dns.aRecords.map((ip, i) => (
                          <div key={i} className="truncate">{ip}</div>
                        ))}
                      </div>
                    </div>

                    {/* AAAA Record */}
                    <div className="p-4 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-400 uppercase text-[11px] tracking-wider block">
                        AAAA Records (IPv6)
                      </span>
                      <div className="space-y-1 font-mono text-white light:text-slate-900 font-semibold">
                        {dns.aaaaRecords.map((ip6, i) => (
                          <div key={i} className="truncate">{ip6}</div>
                        ))}
                      </div>
                    </div>

                    {/* MX Record */}
                    <div className="p-4 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-400 uppercase text-[11px] tracking-wider block">
                        MX Records (Mail Exchange)
                      </span>
                      <div className="space-y-1 font-mono text-white light:text-slate-900 text-[11px]">
                        {dns.mxRecords.map((mx, i) => (
                          <div key={i} className="truncate">{mx}</div>
                        ))}
                      </div>
                    </div>

                    {/* NS Record */}
                    <div className="p-4 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-400 uppercase text-[11px] tracking-wider block">
                        NS Records (Nameservers)
                      </span>
                      <div className="space-y-1 font-mono text-white light:text-slate-900 text-[11px]">
                        {dns.nsRecords.map((ns, i) => (
                          <div key={i} className="truncate">{ns}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* DNS Security Status Bar */}
                  <div className="p-4 rounded-xl bg-slate-900/40 light:bg-slate-100 border border-slate-800/80 light:border-slate-200 space-y-2 text-xs">
                    <span className="font-bold text-white light:text-slate-900 block">
                      DNS Zone Security Posture
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-center space-x-2">
                        {dns.dnsSecurityStatus.dnssecStatus === 'PASS' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : dns.dnsSecurityStatus.dnssecStatus === 'WARN' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        )}
                        <span className="text-slate-300 light:text-slate-700">
                          <strong>DNSSEC: </strong> {dns.dnsSecurityStatus.dnssec}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {dns.dnsSecurityStatus.caaStatus === 'PASS' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        )}
                        <span className="text-slate-300 light:text-slate-700">
                          <strong>CAA Policy: </strong> {dns.dnsSecurityStatus.caaRecord}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span className="text-slate-300 light:text-slate-700">
                          <strong>TTL Window: </strong> {dns.dnsSecurityStatus.ttl}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. SECURITY FINDINGS */}
                <div className="p-6 rounded-2xl bg-[#0f172a] light:bg-white border border-[#1e293b] light:border-slate-200 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 light:border-slate-200 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-base text-white light:text-slate-900">
                          4. Correlated Security Findings & Action Items
                        </h2>
                        <span className="text-xs text-slate-400 light:text-slate-500">
                          Prioritized vulnerabilities and operational remediation guidance
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 light:bg-slate-100 text-slate-300 light:text-slate-700">
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
                          className="p-4 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-sm text-white light:text-slate-900">
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

                          <p className="text-slate-400 light:text-slate-600 leading-relaxed">
                            {finding.description}
                          </p>

                          <div className="p-2.5 rounded-lg bg-blue-500/10 light:bg-blue-50 border border-blue-500/20 text-blue-300 light:text-blue-800">
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
          <div className="p-3 text-center text-xs text-slate-500 italic">
            {SIMULATION_DISCLAIMER}
          </div>
        </main>
      </div>
    </div>
  )
}
