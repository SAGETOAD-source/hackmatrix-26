import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  ArrowLeft,
  Download,
  Copy,
  RefreshCw,
  Globe,
  Lock,
  Cpu,
  Database,
  AlertTriangle,
  FileText,
  Check,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react'
import { motion } from 'framer-motion'
import Sidebar from '../components/dashboard/Sidebar'
import TopNavbar from '../components/dashboard/TopNavbar'
import RiskGauge from '../components/results/RiskGauge'
import FindingCard from '../components/results/FindingCard'
import HeaderAuditRow from '../components/results/HeaderAuditRow'
import CertificateCard from '../components/results/CertificateCard'
import { SIMULATION_DISCLAIMER } from '../data/mockData'
import { generateReportText, simulateScan } from '../utils/simulateScan'
import { getLatestScan, setLatestScan } from '../services/scanService'
import { getApiBaseUrl } from '../services/api'

function getInitialScan(urlParam) {
  const stored = getLatestScan()
  if (stored) {
    if (!urlParam || stored.url === urlParam) {
      return stored
    }
  }

  if (urlParam) {
    const generated = simulateScan(urlParam)
    setLatestScan(generated)
    return generated
  }

  return null
}

export default function ScanResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const urlParam = searchParams.get('url')

  const [collapsed, setCollapsed] = useState(false)
  const [scanResult, setScanResult] = useState(() => getInitialScan(urlParam))
  const [prevParam, setPrevParam] = useState(urlParam)
  const [copied, setCopied] = useState(false)

  // Synchronize state if URL query param changes
  if (urlParam !== prevParam) {
    setPrevParam(urlParam)
    setScanResult(getInitialScan(urlParam))
  }

  // Copy target URL
  const handleCopyUrl = () => {
    if (!scanResult?.url) return
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(scanResult.url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }).catch(() => {
        fallbackCopy(scanResult.url)
      })
    } else {
      fallbackCopy(scanResult.url)
    }
  }

  const fallbackCopy = (text) => {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Rescan action
  const handleRescan = () => {
    if (scanResult?.url) {
      navigate(`/scanner?url=${encodeURIComponent(scanResult.url)}`)
    } else {
      navigate('/scanner')
    }
  }

  // Download raw report
  const handleDownloadReport = () => {
    if (!scanResult) return
    const text = generateReportText(scanResult)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `threatsentinel-report-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const isPhish = scanResult?.prediction === 'phishing'
  const isSuspicious = scanResult?.prediction === 'suspicious'

  return (
    <div className="min-h-screen bg-[#080F1E] light:bg-[#F5F7FC] text-[#F1F5FF] light:text-[#172033] transition-colors duration-200 flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'ml-0 md:ml-20' : 'ml-0 md:ml-64'}`}>
        <TopNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl w-full mx-auto">
          {/* Top Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              to="/scanner"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#9EACC2] hover:text-[#F1F5FF] light:hover:text-[#172033] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Scanner</span>
            </Link>

            {scanResult && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#111E32] light:bg-white hover:bg-[#162744] light:hover:bg-slate-100 text-[#9EACC2] light:text-[#172033] border border-[#1C2D4A] light:border-[#E2E8F0] flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleRescan}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#111E32] light:bg-white hover:bg-[#162744] light:hover:bg-slate-100 text-[#9EACC2] light:text-[#172033] border border-[#1C2D4A] light:border-[#E2E8F0] flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Rescan Target</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#287FE9] hover:bg-[#1E6FD6] text-white shadow-md shadow-[#287FE9]/25 flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report (.txt)</span>
                </button>

                <Link
                  to="/scanner"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#111E32] light:bg-white hover:bg-[#162744] light:hover:bg-slate-100 text-[#9EACC2] light:text-[#172033] border border-[#1C2D4A] light:border-[#E2E8F0] flex items-center space-x-1.5 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>New Scan</span>
                </Link>
              </div>
            )}
          </div>

          {/* Simulation / API Mode Banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 light:text-amber-800 flex items-start sm:items-center space-x-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold">
                {scanResult?.isLiveApi
                  ? 'Live Backend API Audit Report:'
                  : scanResult?.apiFallback
                  ? 'Offline Fallback Assessment:'
                  : 'Simulated Demonstration Report:'}
              </span>{' '}
              {scanResult?.isLiveApi
                ? `Results retrieved live from backend API (${getApiBaseUrl()}). Telemetry and predictions reflect server evaluation.`
                : scanResult?.apiFallback
                ? 'Backend service is unreachable; displaying local cached assessment.'
                : 'This report represents a simulated client-side heuristic evaluation designed for cybersecurity SaaS demonstration. Indicators and findings do not reflect live malicious network activity.'}
            </div>
          </div>

          {/* Empty State when no result available */}
          {!scanResult && (
            <div className="p-12 text-center rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] space-y-4 shadow-xl">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#287FE9]/10 text-[#55B7FF] flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-[#F1F5FF] light:text-[#172033]">
                No Scan Telemetry Available
              </h2>
              <p className="text-sm text-[#9EACC2] light:text-[#64748B] max-w-md mx-auto">
                No scan results are currently loaded in your session. Input a URL or pick one of our curated security demonstration samples.
              </p>
              <div className="pt-2">
                <Link
                  to="/scanner"
                  className="cyber-btn-primary px-6 py-3 text-sm font-bold inline-flex items-center space-x-2"
                >
                  <span>Launch URL Scanner</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Full Results View */}
          {scanResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Verdict & Score Banner */}
              <div
                className={`p-6 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${
                  isPhish
                    ? 'bg-gradient-to-br from-rose-950/40 via-[#111E32] to-[#080F1E] light:from-rose-50 light:via-white light:to-white border-rose-500/30'
                    : isSuspicious
                    ? 'bg-gradient-to-br from-amber-950/40 via-[#111E32] to-[#080F1E] light:from-amber-50 light:via-white light:to-white border-amber-500/30'
                    : 'bg-gradient-to-br from-emerald-950/40 via-[#111E32] to-[#080F1E] light:from-emerald-50 light:via-white light:to-white border-emerald-500/30'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  {/* Left: Verdict info */}
                  <div className="flex items-start sm:items-center space-x-4 sm:space-x-5">
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 ${
                        isPhish
                          ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/30'
                          : isSuspicious
                          ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/30'
                          : 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30'
                      }`}
                    >
                      {isPhish ? (
                        <ShieldAlert className="w-10 h-10" />
                      ) : isSuspicious ? (
                        <ShieldCheck className="w-10 h-10" />
                      ) : (
                        <CheckCircle className="w-10 h-10" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span
                          className={`px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                            isPhish
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : isSuspicious
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {scanResult.riskLevel} RISK LEVEL
                        </span>
                        <span className="text-xs font-semibold text-[#9EACC2] light:text-[#64748B]">
                          {Math.round((scanResult.confidence || 0.95) * 100)}% ML Confidence
                        </span>
                        <span className="text-xs text-[#9EACC2] light:text-[#64748B]">•</span>
                        <span className="text-xs text-[#9EACC2] light:text-[#64748B] flex items-center space-x-1">
                          <Clock className="w-3 h-3 inline" />
                          <span>{scanResult.isLiveApi ? 'Live API Audit' : 'Simulated Audit'}</span>
                        </span>
                      </div>

                      <h1 className="text-2xl sm:text-3xl font-black text-[#F1F5FF] light:text-[#172033] tracking-tight">
                        Verdict: {scanResult.prediction?.toUpperCase()}
                      </h1>

                      <div className="mt-2 flex items-center space-x-2">
                        <p className="text-xs sm:text-sm text-[#F1F5FF] light:text-[#172033] font-mono break-all max-w-xl">
                          {scanResult.url}
                        </p>
                        <button
                          type="button"
                          onClick={handleCopyUrl}
                          title="Copy target URL"
                          className="text-[#9EACC2] hover:text-[#F1F5FF] light:hover:text-[#172033] p-1 rounded cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Circular Gauge */}
                  <div className="self-center lg:self-auto flex flex-col items-center p-3 rounded-2xl bg-[#111E32]/90 light:bg-white/95 border border-[#1C2D4A] light:border-[#E2E8F0]">
                    <RiskGauge
                      score={scanResult.riskScore}
                      riskLevel={scanResult.riskLevel}
                      size={170}
                    />
                  </div>
                </div>
              </div>

              {/* 5-Pillar Score Weights Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9EACC2] light:text-[#64748B] mb-3 flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#55B7FF]" />
                  <span>Multi-Pillar Engine Score Breakdown</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    {
                      label: 'ML Prediction',
                      score: scanResult.componentScores?.mlAnalysis ?? (isPhish ? 95 : 6),
                      weight: '30%',
                      icon: Cpu,
                      desc: 'Heuristic keyword & pattern classification',
                    },
                    {
                      label: 'Domain Lexical',
                      score: scanResult.componentScores?.domainLexical ?? (isPhish ? 88 : 8),
                      weight: '20%',
                      icon: Globe,
                      desc: 'Entropy, length & character ratios',
                    },
                    {
                      label: 'Web Security',
                      score: scanResult.componentScores?.webSecurity ?? (isPhish ? 75 : 10),
                      weight: '15%',
                      icon: Shield,
                      desc: 'Passive HTTP security headers hygiene',
                    },
                    {
                      label: 'TLS Certificate',
                      score: scanResult.componentScores?.tlsCertificate ?? (isPhish ? 80 : 5),
                      weight: '15%',
                      icon: Lock,
                      desc: 'Cryptographic trust & SAN validation',
                    },
                    {
                      label: 'Threat Feeds',
                      score: scanResult.componentScores?.threatIntel ?? (isPhish ? 100 : 0),
                      weight: '20%',
                      icon: Database,
                      desc: 'PhishTank & URLhaus IOC correlation',
                    },
                  ].map((pillar, idx) => {
                    const PillarIcon = pillar.icon
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] space-y-2 shadow-xs"
                      >
                        <div className="flex items-center justify-between text-xs text-[#9EACC2]">
                          <span className="font-semibold text-[#F1F5FF] light:text-[#172033]">{pillar.label}</span>
                          <PillarIcon className="w-3.5 h-3.5 text-[#55B7FF]" />
                        </div>
                        <div className="flex items-baseline justify-between">
                          <div className="text-xl sm:text-2xl font-black text-[#F1F5FF] light:text-[#172033]">
                            {pillar.score}%
                          </div>
                          <span className="text-[10px] font-bold text-[#9EACC2] light:text-[#64748B] uppercase">
                            Wt: {pillar.weight}
                          </span>
                        </div>
                        {/* Progress line */}
                        <div className="w-full bg-[#0B1528] light:bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pillar.score > 60
                                ? 'bg-rose-500'
                                : pillar.score > 30
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${pillar.score}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* URL Characteristics Section (18 Features) */}
              <div className="p-6 rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-[#55B7FF]" />
                    <h3 className="font-bold text-base text-[#F1F5FF] light:text-[#172033]">
                      URL Lexical & Structural Characteristics (18 Features)
                    </h3>
                  </div>
                  <span className="text-xs text-[#9EACC2] light:text-[#64748B]">Feature Extraction Engine</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                  {scanResult.urlCharacteristics && [
                    { label: 'URL Length', value: `${scanResult.urlCharacteristics.urlLength} chars` },
                    { label: 'Domain Length', value: `${scanResult.urlCharacteristics.domainLength} chars` },
                    { label: 'Dot Count', value: scanResult.urlCharacteristics.dotCount },
                    { label: 'Hyphen Count', value: scanResult.urlCharacteristics.hyphenCount },
                    { label: 'Special Chars', value: scanResult.urlCharacteristics.specialCharCount },
                    { label: 'Subdomains', value: scanResult.urlCharacteristics.subdomainCount },
                    {
                      label: 'Raw IP Host',
                      value: scanResult.urlCharacteristics.hasIPAddress ? 'Detected' : 'No',
                      flag: scanResult.urlCharacteristics.hasIPAddress,
                    },
                    {
                      label: '@ Symbol',
                      value: scanResult.urlCharacteristics.hasAtSymbol ? 'Present' : 'None',
                      flag: scanResult.urlCharacteristics.hasAtSymbol,
                    },
                    {
                      label: 'Suspicious Encoding',
                      value: scanResult.urlCharacteristics.hasSuspiciousEncoding ? 'Detected' : 'Clean',
                      flag: scanResult.urlCharacteristics.hasSuspiciousEncoding,
                    },
                    {
                      label: 'Transport HTTPS',
                      value: scanResult.urlCharacteristics.isHTTPS ? 'Active' : 'Insecure HTTP',
                      flag: !scanResult.urlCharacteristics.isHTTPS,
                    },
                    { label: 'Path Length', value: `${scanResult.urlCharacteristics.pathLength} chars` },
                    { label: 'Query Params', value: scanResult.urlCharacteristics.queryParamCount },
                    {
                      label: 'High-Abuse TLD',
                      value: scanResult.urlCharacteristics.suspiciousTLD ? 'Flagged (.xyz/.top...)' : 'Standard',
                      flag: scanResult.urlCharacteristics.suspiciousTLD,
                    },
                    { label: 'Domain Entropy', value: `${scanResult.urlCharacteristics.domainEntropy} bits` },
                    {
                      label: 'Punycode Homograph',
                      value: scanResult.urlCharacteristics.hasPunycode ? 'Present (xn--)' : 'None',
                      flag: scanResult.urlCharacteristics.hasPunycode,
                    },
                    {
                      label: 'Suspicious Port',
                      value: scanResult.urlCharacteristics.suspiciousPort ? 'Non-standard' : 'Standard 80/443',
                      flag: scanResult.urlCharacteristics.suspiciousPort,
                    },
                    {
                      label: 'URL Shortener',
                      value: scanResult.urlCharacteristics.isURLShortener ? 'Known Shortener' : 'Direct Host',
                      flag: scanResult.urlCharacteristics.isURLShortener,
                    },
                    {
                      label: 'Lure Keywords',
                      value:
                        scanResult.urlCharacteristics.suspiciousKeywords?.length > 0
                          ? scanResult.urlCharacteristics.suspiciousKeywords.join(', ')
                          : 'None',
                      flag: scanResult.urlCharacteristics.suspiciousKeywords?.length > 0,
                    },
                  ].map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0]"
                    >
                      <span className="text-[11px] text-[#9EACC2] light:text-[#64748B] block mb-1 truncate">
                        {feat.label}
                      </span>
                      <span
                        className={`font-semibold block truncate ${
                          feat.flag ? 'text-rose-400 font-bold' : 'text-[#F1F5FF] light:text-[#172033]'
                        }`}
                      >
                        {feat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid: SSL/TLS Certificate + HTTP Headers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SSL/TLS Certificate Status */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-[#55B7FF]" />
                    <h3 className="font-bold text-base text-[#F1F5FF] light:text-[#172033]">
                      Cryptographic & Certificate Health
                    </h3>
                  </div>
                  <CertificateCard sslStatus={scanResult.sslStatus} />
                </div>

                {/* HTTP Security Headers Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-[#55B7FF]" />
                      <h3 className="font-bold text-base text-[#F1F5FF] light:text-[#172033]">
                        Passive HTTP Security Headers Audit
                      </h3>
                    </div>
                    <span className="text-xs text-[#9EACC2] light:text-[#64748B]">Security Baseline</span>
                  </div>

                  <div className="space-y-2">
                    {scanResult.httpHeaders?.map((hdr, idx) => (
                      <HeaderAuditRow
                        key={idx}
                        name={hdr.name}
                        present={hdr.present}
                        value={hdr.value}
                        severity={hdr.severity}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Suspicious Indicators Section */}
              <div className="p-6 rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-base text-[#F1F5FF] light:text-[#172033]">
                      Suspicious Indicators & Evidence
                    </h3>
                  </div>
                  <span className="text-xs text-[#9EACC2] light:text-[#64748B]">
                    {scanResult.suspiciousIndicators?.length || 0} Flags Detected
                  </span>
                </div>

                {scanResult.suspiciousIndicators?.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>No active suspicious indicators or malicious patterns flagged for this target.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scanResult.suspiciousIndicators?.map((indicator, idx) => (
                      <FindingCard
                        key={idx}
                        title={indicator.title}
                        severity={indicator.severity}
                        description={indicator.description}
                        icon={indicator.severity === 'CRITICAL' ? ShieldAlert : AlertTriangle}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Security Recommendations Section */}
              <div className="p-6 rounded-2xl bg-[#111E32] light:bg-white border border-[#1C2D4A] light:border-[#E2E8F0] shadow-xl space-y-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#55B7FF]" />
                  <h3 className="font-bold text-base text-[#F1F5FF] light:text-[#172033]">
                    Recommended Security Actions & Remediation
                  </h3>
                </div>

                <div className="space-y-3">
                  {scanResult.recommendations?.map((rec, idx) => {
                    const isHigh = rec.priority === 'HIGH'
                    const isMedium = rec.priority === 'MEDIUM'

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[#0B1528] light:bg-[#F5F7FC] border border-[#1C2D4A] light:border-[#E2E8F0] flex items-start space-x-3 text-xs"
                      >
                        <div
                          className={`mt-0.5 p-1 rounded-lg ${
                            isHigh
                              ? 'bg-rose-500/20 text-rose-400'
                              : isMedium
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {isHigh ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <HelpCircle className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-sm text-[#F1F5FF] light:text-[#172033]">
                              {rec.title}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                isHigh
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : isMedium
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}
                            >
                              Priority: {rec.priority}
                            </span>
                          </div>
                          <p className="text-[#9EACC2] light:text-[#64748B] leading-relaxed">
                            {rec.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Footer note */}
          <div className="p-3 text-center text-xs text-[#9EACC2] italic">
            {SIMULATION_DISCLAIMER}
          </div>
        </main>
      </div>
    </div>
  )
}
