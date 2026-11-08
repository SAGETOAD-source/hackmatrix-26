import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  Download,
  Copy,
  RefreshCw,
  Globe,
  Cpu,
  AlertTriangle,
  FileText,
  Check,
  CheckCircle2,
  XCircle
} from 'lucide-react'
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

  const handleRescan = () => {
    if (scanResult?.url) {
      navigate(`/scanner?url=${encodeURIComponent(scanResult.url)}`)
    } else {
      navigate('/scanner')
    }
  }

  const handleDownloadReport = () => {
    if (!scanResult) return
    const text = generateReportText(scanResult)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `phishguard-report-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const verdictUpper = (scanResult?.verdict || scanResult?.prediction || '').toUpperCase()
  const isPhish = verdictUpper === 'PHISHING' || (scanResult?.riskScore >= 60)
  const isSuspicious = !isPhish && (verdictUpper === 'SUSPICIOUS' || (scanResult?.riskScore >= 30 && scanResult?.riskScore < 60))
  const isPending = scanResult?.status === 'pending' || scanResult?.isPending

  return (
    <div className="min-h-screen bg-[#080F1E] light:bg-[#F5F7FC] text-[#F1F5FF] light:text-[#172033] transition-colors duration-200 flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${collapsed ? 'ml-0 md:ml-18' : 'ml-0 md:ml-60'}`}>
        <TopNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl w-full mx-auto">
          {/* Top Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Link
              to="/scanner"
              className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#9EACC2] hover:text-[#F1F5FF] light:hover:text-[#172033] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Scanner</span>
            </Link>

            {scanResult && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="px-2.5 py-1.5 rounded-md text-xs font-mono bg-[#111E32] light:bg-white hover:bg-[#15253F] light:hover:bg-slate-100 text-[#9EACC2] light:text-[#172033] border border-[#24344B] light:border-[#E2E8F0] flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleRescan}
                  className="px-2.5 py-1.5 rounded-md text-xs font-mono bg-[#111E32] light:bg-white hover:bg-[#15253F] light:hover:bg-slate-100 text-[#9EACC2] light:text-[#172033] border border-[#24344B] light:border-[#E2E8F0] flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Rescan Target</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="cyber-btn-primary text-xs py-1.5 px-3 space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report (.txt)</span>
                </button>
              </div>
            )}
          </div>

          {/* Simulation / API Mode Banner */}
          <div className="p-3 rounded-md bg-[#0D1728] light:bg-amber-50 border border-[#24344B] light:border-amber-200 text-xs text-[#9EACC2] light:text-amber-900 flex items-start sm:items-center space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong className="text-[#F1F5FF] light:text-amber-950 font-semibold font-mono">
                {scanResult?.isLiveApi
                  ? 'LIVE BACKEND AUDIT:'
                  : scanResult?.apiFallback
                  ? 'CACHED FALLBACK ASSESSMENT:'
                  : 'SIMULATED DEMONSTRATION REPORT:'}
              </strong>{' '}
              {scanResult?.isLiveApi
                ? `Retrieved live from API server (${getApiBaseUrl()}). Telemetry reflects backend ML feature inference.`
                : scanResult?.apiFallback
                ? 'Backend API was unreachable; presenting deterministic local evaluation.'
                : 'Synthetic telemetry generated client-side for demonstration and UI/UX evaluation.'}
            </span>
          </div>

          {/* Empty State when no result available */}
          {!scanResult && (
            <div className="p-12 text-center rounded-lg cyber-card space-y-3">
              <div className="w-12 h-12 mx-auto rounded-md bg-[#0D1728] border border-[#24344B] text-[#287FE9] flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-[#F1F5FF] light:text-[#172033]">
                No Target Loaded
              </h2>
              <p className="text-xs text-[#9EACC2] light:text-[#64748B] max-w-sm mx-auto">
                No active scan result found. Please enter a target URL in the scanner to generate an audit report.
              </p>
              <div className="pt-2">
                <Link to="/scanner" className="cyber-btn-primary text-xs py-2 px-4">
                  Open Scanner Console
                </Link>
              </div>
            </div>
          )}

          {/* Full Results View */}
          {scanResult && (
            <div className="space-y-6">
              {/* Verdict & Score Banner (Clean, high-contrast, structured) */}
              <div
                className={`cyber-card p-5 sm:p-6 border-l-4 ${
                  isPending
                    ? 'border-l-blue-500'
                    : isPhish
                    ? 'border-l-rose-500'
                    : isSuspicious
                    ? 'border-l-amber-500'
                    : 'border-l-emerald-500'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  {/* Left: Verdict info */}
                  <div className="flex items-start space-x-4 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                        isPending
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : isPhish
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : isSuspicious
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isPending ? (
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      ) : isPhish ? (
                        <ShieldAlert className="w-6 h-6" />
                      ) : isSuspicious ? (
                        <AlertTriangle className="w-6 h-6" />
                      ) : (
                        <ShieldCheck className="w-6 h-6" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            isPending
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : isPhish
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : isSuspicious
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {isPending ? 'PROCESSING TICKET' : `${scanResult.verdict || scanResult.prediction} VERDICT`}
                        </span>
                        <span className="text-[11px] font-mono text-[#9EACC2] light:text-[#64748B]">
                          {scanResult.mlAnalysis?.model ? `Model (${scanResult.mlAnalysis.model})` : 'Model'} Confidence: {Math.round((scanResult.confidence || 0.95) * 100)}%
                        </span>
                      </div>

                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F5FF] light:text-[#172033]">
                        Verdict: {scanResult.prediction?.toUpperCase()}
                      </h1>

                      <div className="mt-1 flex items-center space-x-2">
                        <p className="text-xs font-mono text-[#9EACC2] light:text-[#64748B] break-all max-w-lg">
                          {scanResult.url}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Circular Gauge */}
                  <div className="self-center lg:self-auto p-2 rounded-lg bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]">
                    <RiskGauge
                      score={scanResult.riskScore}
                      riskLevel={scanResult.riskLevel}
                      size={150}
                    />
                  </div>
                </div>
              </div>

              {/* Multi-Pillar Engine Weight Breakdown */}
              <div>
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#9EACC2] light:text-[#64748B] mb-2.5 flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#287FE9]" />
                  <span>Multi-Pillar Composite Weight Breakdown</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    {
                      label: 'ML Model',
                      score: scanResult.componentScores?.mlAnalysis ?? (isPhish ? 95 : 6),
                      weight: '30%',
                      desc: 'Lexical heuristics',
                    },
                    {
                      label: 'Entropy/Domain',
                      score: scanResult.componentScores?.domainLexical ?? (isPhish ? 88 : 8),
                      weight: '20%',
                      desc: 'Character distribution',
                    },
                    {
                      label: 'Header Hygiene',
                      score: scanResult.componentScores?.webSecurity ?? (isPhish ? 75 : 10),
                      weight: '15%',
                      desc: 'Passive HTTP response',
                    },
                    {
                      label: 'TLS / SAN',
                      score: scanResult.componentScores?.tlsCertificate ?? (isPhish ? 80 : 5),
                      weight: '15%',
                      desc: 'Cryptographic trust',
                    },
                    {
                      label: 'Threat Feeds',
                      score: scanResult.componentScores?.threatIntel ?? (isPhish ? 100 : 0),
                      weight: '20%',
                      desc: 'PhishTank & URLhaus',
                    },
                  ].map((pillar, idx) => (
                    <div key={idx} className="cyber-card p-3 space-y-1.5 font-mono">
                      <div className="flex items-center justify-between text-[11px] text-[#9EACC2]">
                        <span>{pillar.label}</span>
                        <span className="text-[10px] text-[#9EACC2]">{pillar.weight}</span>
                      </div>
                      <div className="text-lg font-bold text-[#F1F5FF] light:text-[#172033]">
                        {pillar.score}%
                      </div>
                      <div className="w-full bg-[#0D1728] light:bg-slate-200 h-1 rounded-full overflow-hidden">
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
                  ))}
                </div>
              </div>

              {/* 18 Lexical & Structural Characteristics */}
              <div className="cyber-card p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#24344B] light:border-[#E2E8F0]">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-[#287FE9]" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F1F5FF] light:text-[#172033]">
                      Extracted Lexical Characteristics (18 Features)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#9EACC2] light:text-[#64748B]">Deterministic Heuristics</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
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
                      label: 'Abuse TLD',
                      value: scanResult.urlCharacteristics.suspiciousTLD ? 'Flagged (.xyz/.top)' : 'Standard',
                      flag: scanResult.urlCharacteristics.suspiciousTLD,
                    },
                    { label: 'Shannon Entropy', value: `${scanResult.urlCharacteristics.domainEntropy} bits` },
                    {
                      label: 'Punycode IDN',
                      value: scanResult.urlCharacteristics.hasPunycode ? 'Present (xn--)' : 'None',
                      flag: scanResult.urlCharacteristics.hasPunycode,
                    },
                    {
                      label: 'Non-Std Port',
                      value: scanResult.urlCharacteristics.suspiciousPort ? 'Flagged' : 'Standard',
                      flag: scanResult.urlCharacteristics.suspiciousPort,
                    },
                    {
                      label: 'Shortener',
                      value: scanResult.urlCharacteristics.isURLShortener ? 'Yes' : 'Direct Host',
                      flag: scanResult.urlCharacteristics.isURLShortener,
                    },
                    {
                      label: 'Lure Keyword',
                      value:
                        scanResult.urlCharacteristics.suspiciousKeywords?.length > 0
                          ? scanResult.urlCharacteristics.suspiciousKeywords[0]
                          : 'None',
                      flag: scanResult.urlCharacteristics.suspiciousKeywords?.length > 0,
                    },
                  ].map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0]"
                    >
                      <span className="text-[10px] text-[#9EACC2] light:text-[#64748B] block truncate">
                        {feat.label}
                      </span>
                      <span
                        className={`text-xs block truncate mt-0.5 ${
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <CertificateCard sslStatus={scanResult.sslStatus} />

                {/* HTTP Security Headers Section */}
                <div className="cyber-card p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#24344B] light:border-[#E2E8F0]">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-[#287FE9]" />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-[#F1F5FF] light:text-[#172033]">
                        Passive HTTP Response Headers Audit
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#9EACC2] light:text-[#64748B]">Hygiene Baseline</span>
                  </div>

                  <div className="space-y-1.5">
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

              {/* Suspicious Findings */}
              <div className="cyber-card p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#24344B] light:border-[#E2E8F0]">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#F1F5FF] light:text-[#172033]">
                      Flagged Threat Indicators ({scanResult.suspiciousIndicators?.length || 0})
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#9EACC2]">Evidence Matrix</span>
                </div>

                {scanResult.suspiciousIndicators?.length === 0 ? (
                  <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2 font-mono">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Zero active suspicious indicators or high-entropy anomalies detected.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
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

              {/* Actionable Security Recommendations */}
              <div className="cyber-card p-4 sm:p-5 space-y-3">
                <div className="flex items-center space-x-2 pb-2 border-b border-[#24344B] light:border-[#E2E8F0]">
                  <FileText className="w-4 h-4 text-[#287FE9]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#F1F5FF] light:text-[#172033]">
                    Defensive Remediation Playbook
                  </h3>
                </div>

                <div className="space-y-2">
                  {scanResult.recommendations?.map((rec, idx) => {
                    const isHigh = rec.priority === 'HIGH'
                    const isMedium = rec.priority === 'MEDIUM'

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-md bg-[#0D1728] light:bg-slate-50 border border-[#24344B] light:border-[#E2E8F0] flex items-start space-x-2.5 text-xs font-mono"
                      >
                        <div
                          className={`mt-0.5 p-1 rounded shrink-0 ${
                            isHigh
                              ? 'bg-rose-500/15 text-rose-400'
                              : isMedium
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-blue-500/15 text-blue-400'
                          }`}
                        >
                          {isHigh ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="font-bold text-xs text-[#F1F5FF] light:text-[#172033]">
                              {rec.title}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                isHigh
                                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                                  : isMedium
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                                  : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                              }`}
                            >
                              Priority: {rec.priority}
                            </span>
                          </div>
                          <p className="text-[#9EACC2] light:text-[#64748B] text-[11px] leading-relaxed">
                            {rec.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="p-2 text-center text-[11px] font-mono text-[#9EACC2] italic">
            {SIMULATION_DISCLAIMER}
          </div>
        </main>
      </div>
    </div>
  )
}
