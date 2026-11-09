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
  XCircle,
  FileCode
} from 'lucide-react'
import Sidebar from '../components/dashboard/Sidebar'
import TopNavbar from '../components/dashboard/TopNavbar'
import RiskGauge from '../components/results/RiskGauge'
import FindingCard from '../components/results/FindingCard'
import HeaderAuditRow from '../components/results/HeaderAuditRow'
import CertificateCard from '../components/results/CertificateCard'
import BrandImpersonationDiff from '../components/ui/BrandImpersonationDiff'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Aurora from '../components/backgrounds/Aurora'
import { useTheme } from '../context/ThemeContext'
import { SIMULATION_DISCLAIMER } from '../data/mockData'
import { generateReportText, simulateScan } from '../utils/simulateScan'
import { getLatestScan, setLatestScan } from '../services/scanService'
import { getApiBaseUrl } from '../services/api'
import {
  normalizeHttpHeaders,
  normalizeFindings,
  normalizeRecommendations,
} from '../utils/headerNormalization'

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

function getVerdictType(scanResult) {
  const verdictUpper = (scanResult?.verdict || scanResult?.prediction || '').toUpperCase()
  if (verdictUpper === 'PHISHING' || verdictUpper === 'MALICIOUS' || (scanResult?.riskScore >= 60)) {
    return 'malicious'
  }
  if (verdictUpper === 'SUSPICIOUS' || (scanResult?.riskScore >= 30 && scanResult?.riskScore < 60)) {
    return 'suspicious'
  }
  if (verdictUpper === 'LEGITIMATE' || verdictUpper === 'SAFE' || scanResult?.riskScore < 30) {
    return 'safe'
  }
  return 'unknown'
}

export default function ScanResultsPage() {
  const { isDark } = useTheme()
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

  const handleExportJson = () => {
    if (!scanResult) return
    const blob = new Blob([JSON.stringify(scanResult, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `phishguard-telemetry-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const verdict = getVerdictType(scanResult)
  const isPending = scanResult?.status === 'pending' || scanResult?.isPending

  // Detect brand impersonation heuristic
  const isSpoofed = scanResult?.urlCharacteristics?.suspiciousKeywords?.length > 0 || (scanResult?.url && /paypal|apple|google|microsoft|amazon|netflix/i.test(scanResult.url))

  // Safe normalization of collections to prevent runtime exceptions on object/null payloads
  const httpHeaders = normalizeHttpHeaders(scanResult?.httpHeaders)
  const suspiciousIndicators = normalizeFindings(scanResult?.suspiciousIndicators || scanResult?.findings)
  const recommendations = normalizeRecommendations(scanResult?.recommendations)

  // Ambient Aurora color palette reflecting security posture in Ocean Teal
  const auroraStops = isPending
    ? ['#167D83', '#55B9AD', '#167D83']
    : verdict === 'malicious'
    ? ['#18343A', '#EF6464', '#167D83']
    : verdict === 'suspicious'
    ? ['#18343A', '#E9B65B', '#167D83']
    : verdict === 'safe'
    ? ['#18343A', '#55B9AD', '#167D83']
    : ['#18343A', '#55B9AD', '#167D83']

  return (
    <div className="min-h-screen bg-[#101C22] light:bg-[#E0F2ED] text-[#F5F7F6] light:text-[#101C22] transition-colors duration-200 flex relative overflow-hidden">
      {/* Ambient Aurora Wave reflecting target threat level */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <Aurora
          colorStops={auroraStops}
          blend={0.5}
          amplitude={1.2}
          speed={0.4}
          opacity={isDark ? 0.38 : 0.20}
          lightMode={!isDark}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-[#101C22]/20 light:bg-[#E0F2ED]/30 pointer-events-none" />
      </div>

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 relative z-10 ${collapsed ? 'ml-0 md:ml-18' : 'ml-0 md:ml-60'}`}>
        <TopNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl w-full mx-auto">
          {/* Top Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Link
              to="/scanner"
              className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#A4B8B5] hover:text-[#F5F7F6] light:hover:text-[#101C22] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Scanner</span>
            </Link>

            {scanResult && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleCopyUrl}
                  variant="outline"
                  size="sm"
                  icon={copied ? Check : Copy}
                >
                  {copied ? 'Copied' : 'Copy URL'}
                </Button>

                <Button
                  onClick={handleRescan}
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                >
                  Rescan Target
                </Button>

                <Button
                  onClick={handleExportJson}
                  variant="secondary"
                  size="sm"
                  icon={FileCode}
                >
                  JSON
                </Button>

                <Button
                  onClick={handleDownloadReport}
                  variant="primary"
                  size="sm"
                  icon={Download}
                >
                  Export Report (.txt)
                </Button>
              </div>
            )}
          </div>

          {/* Simulation / API Mode Banner */}
          <div className="p-3.5 rounded-xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] text-xs text-[#A4B8B5] light:text-[#4B6B67] flex items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start sm:items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-[#E9B65B] shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong className="text-[#F5F7F6] light:text-[#101C22] font-semibold font-mono">
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
            <Badge verdict={scanResult?.isLiveApi ? 'safe' : 'suspicious'} size="sm">
              {scanResult?.isLiveApi ? 'Live API' : 'Simulated'}
            </Badge>
          </div>

          {/* Empty State when no result available */}
          {!scanResult && (
            <div className="p-12 text-center rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-md space-y-4">
              <div className="w-12 h-12 mx-auto rounded-xl bg-[#101C22] border border-[#24454C] text-[#55B9AD] flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="font-heading text-lg font-bold text-[#F5F7F6] light:text-[#101C22]">
                No Target Loaded
              </h2>
              <p className="text-xs text-[#A4B8B5] light:text-[#4B6B67] max-w-sm mx-auto">
                No active scan result found. Please enter a target URL in the scanner to generate an audit report.
              </p>
              <div className="pt-2">
                <Button as={Link} to="/scanner" variant="primary" size="md">
                  Open Scanner Console
                </Button>
              </div>
            </div>
          )}

          {/* Full Results View */}
          {scanResult && (
            <div className="space-y-6">
              {/* Verdict & Score Banner */}
              <div
                className={`p-6 sm:p-7 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] shadow-lg border-l-4 ${
                  isPending
                    ? 'border-l-[#167D83]'
                    : verdict === 'malicious'
                    ? 'border-l-[#EF6464]'
                    : verdict === 'suspicious'
                    ? 'border-l-[#E9B65B]'
                    : 'border-l-[#55B9AD]'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  {/* Left: Verdict info */}
                  <div className="flex items-start space-x-4 min-w-0">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isPending
                          ? 'bg-[#167D83]/15 text-[#55B9AD] border-[#167D83]/40'
                          : verdict === 'malicious'
                          ? 'bg-[#EF6464]/15 text-[#EF6464] border-[#EF6464]/40'
                          : verdict === 'suspicious'
                          ? 'bg-[#E9B65B]/15 text-[#E9B65B] border-[#E9B65B]/40'
                          : 'bg-[#55B9AD]/15 text-[#55B9AD] border-[#55B9AD]/40'
                      }`}
                    >
                      {isPending ? (
                        <RefreshCw className="w-7 h-7 animate-spin" />
                      ) : verdict === 'malicious' ? (
                        <ShieldAlert className="w-7 h-7" />
                      ) : verdict === 'suspicious' ? (
                        <AlertTriangle className="w-7 h-7" />
                      ) : (
                        <ShieldCheck className="w-7 h-7" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <Badge verdict={verdict} size="sm">
                          {isPending ? 'PROCESSING' : `${scanResult.verdict || scanResult.prediction} VERDICT`}
                        </Badge>
                        <span className="text-[11px] font-mono text-[#A4B8B5] light:text-[#4B6B67]">
                          {scanResult.mlAnalysis?.model ? `Model (${scanResult.mlAnalysis.model})` : 'Model'} Confidence: {Math.round((scanResult.confidence || 0.95) * 100)}%
                        </span>
                      </div>

                      <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F7F6] light:text-[#101C22]">
                        Verdict: {scanResult.prediction?.toUpperCase()}
                      </h1>

                      <div className="mt-1.5 flex items-center space-x-2">
                        <p className="text-xs font-mono text-[#A4B8B5] light:text-[#4B6B67] break-all max-w-xl">
                          {scanResult.url}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Circular Gauge */}
                  <div className="self-center lg:self-auto p-3 rounded-2xl bg-[#101C22] light:bg-[#E0F2ED] border border-[#24454C] light:border-[#C2E2DA]">
                    <RiskGauge
                      score={scanResult.riskScore}
                      riskLevel={scanResult.riskLevel}
                      size={155}
                    />
                  </div>
                </div>
              </div>

              {/* Brand Impersonation Warning Banner if applicable */}
              {isSpoofed && (
                <BrandImpersonationDiff
                  targetUrl={scanResult.url}
                  canonicalDomain="paypal.com"
                  similarityScore={Math.min(96, scanResult.riskScore || 88)}
                />
              )}

              {/* Multi-Pillar Engine Weight Breakdown */}
              <div>
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A4B8B5] light:text-[#4B6B67] mb-3 flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#55B9AD]" />
                  <span>Multi-Pillar Composite Weight Breakdown</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    {
                      label: 'ML Model',
                      score: scanResult.componentScores?.mlAnalysis ?? (verdict === 'malicious' ? 95 : 6),
                      weight: '30%',
                      desc: 'Lexical heuristics',
                    },
                    {
                      label: 'Entropy/Domain',
                      score: scanResult.componentScores?.domainLexical ?? (verdict === 'malicious' ? 88 : 8),
                      weight: '20%',
                      desc: 'Character distribution',
                    },
                    {
                      label: 'Header Hygiene',
                      score: scanResult.componentScores?.webSecurity ?? (verdict === 'malicious' ? 75 : 10),
                      weight: '15%',
                      desc: 'Passive HTTP response',
                    },
                    {
                      label: 'TLS / SAN',
                      score: scanResult.componentScores?.tlsCertificate ?? (verdict === 'malicious' ? 80 : 5),
                      weight: '15%',
                      desc: 'Cryptographic trust',
                    },
                    {
                      label: 'Threat Feeds',
                      score: scanResult.componentScores?.threatIntel ?? (verdict === 'malicious' ? 100 : 0),
                      weight: '20%',
                      desc: 'PhishTank & URLhaus',
                    },
                  ].map((pillar, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] space-y-1.5 font-mono shadow-xs">
                      <div className="flex items-center justify-between text-[11px] text-[#A4B8B5] light:text-[#4B6B67]">
                        <span>{pillar.label}</span>
                        <span className="text-[10px] text-[#55B9AD] light:text-[#167D83] font-bold">{pillar.weight}</span>
                      </div>
                      <div className="text-xl font-bold text-[#F5F7F6] light:text-[#101C22]">
                        {pillar.score}%
                      </div>
                      <div className="w-full bg-[#101C22] light:bg-[#D1EBE5] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            pillar.score >= 70
                              ? 'bg-[#EF6464]'
                              : pillar.score >= 40
                              ? 'bg-[#E9B65B]'
                              : 'bg-[#55B9AD]'
                          }`}
                          style={{ width: `${pillar.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 18 Lexical & Structural Characteristics */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#24454C] light:border-[#C2E2DA]">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-[#55B9AD]" />
                    <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#F5F7F6] light:text-[#101C22]">
                      Extracted Lexical Characteristics (18 Features)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#A4B8B5] light:text-[#4B6B67]">Deterministic Feature Vector</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs font-mono">
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
                      className="p-2.5 rounded-xl bg-[#101C22] light:bg-[#E0F2ED] border border-[#24454C] light:border-[#C2E2DA]"
                    >
                      <span className="text-[10px] text-[#A4B8B5] light:text-[#4B6B67] block truncate">
                        {feat.label}
                      </span>
                      <span
                        className={`text-xs block truncate mt-1 ${
                          feat.flag ? 'text-[#EF6464] font-bold' : 'text-[#F5F7F6] light:text-[#101C22]'
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
                <CertificateCard sslStatus={{ ...scanResult.sslStatus, domain: scanResult.domain }} />

                {/* HTTP Security Headers Section */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-[#24454C] light:border-[#C2E2DA]">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-[#55B9AD]" />
                      <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#F5F7F6] light:text-[#101C22]">
                        Passive HTTP Response Headers Audit
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#A4B8B5] light:text-[#4B6B67]">
                      {httpHeaders.length > 0 ? `${httpHeaders.length} Headers Audited` : 'No Headers Detected'}
                    </span>
                  </div>

                  {httpHeaders.length > 0 ? (
                    <div className="space-y-2">
                      {httpHeaders.map((hdr, idx) => (
                        <HeaderAuditRow
                          key={`${hdr.name}-${idx}`}
                          name={hdr.name}
                          present={hdr.present}
                          value={hdr.value}
                          severity={hdr.severity}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[#101C22] light:bg-[#E0F2ED] border border-[#24454C] light:border-[#C2E2DA] text-xs font-mono text-[#A4B8B5] light:text-[#4B6B67] text-center">
                      No HTTP security response header records (HSTS, CSP, X-Frame-Options) were returned for this target host.
                    </div>
                  )}
                </div>
              </div>

              {/* Suspicious Findings */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#24454C] light:border-[#C2E2DA]">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-[#E9B65B]" />
                    <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#F5F7F6] light:text-[#101C22]">
                      Flagged Threat Indicators ({suspiciousIndicators.length})
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#A4B8B5] light:text-[#4B6B67]">Evidence Matrix</span>
                </div>

                {suspiciousIndicators.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#55B9AD]/10 border border-[#55B9AD]/30 text-[#55B9AD] text-xs flex items-center space-x-2.5 font-mono">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Zero active suspicious indicators or high-entropy anomalies detected.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {suspiciousIndicators.map((indicator, idx) => (
                      <FindingCard
                        key={indicator.id || idx}
                        title={indicator.title}
                        severity={indicator.severity}
                        description={indicator.description}
                        details={indicator.details}
                        icon={indicator.severity === 'CRITICAL' ? ShieldAlert : AlertTriangle}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Actionable Security Recommendations */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#18343A] light:bg-white border border-[#24454C] light:border-[#C2E2DA] space-y-3.5 shadow-sm">
                <div className="flex items-center space-x-2 pb-3 border-b border-[#24454C] light:border-[#C2E2DA]">
                  <FileText className="w-4 h-4 text-[#55B9AD]" />
                  <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#F5F7F6] light:text-[#101C22]">
                    Defensive Remediation Playbook
                  </h3>
                </div>

                {recommendations.length > 0 ? (
                  <div className="space-y-2.5">
                    {recommendations.map((rec, idx) => {
                      const isHigh = rec.priority === 'HIGH'
                      const isMedium = rec.priority === 'MEDIUM'

                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-[#101C22] light:bg-[#E0F2ED] border border-[#24454C] light:border-[#C2E2DA] flex items-start space-x-3 text-xs font-mono"
                        >
                          <div
                            className={`mt-0.5 p-1 rounded-lg shrink-0 ${
                              isHigh
                                ? 'bg-[#EF6464]/15 text-[#EF6464]'
                                : isMedium
                                ? 'bg-[#E9B65B]/15 text-[#E9B65B]'
                                : 'bg-[#167D83]/15 text-[#55B9AD]'
                            }`}
                          >
                            {isHigh ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <AlertTriangle className="w-4 h-4" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-xs text-[#F5F7F6] light:text-[#101C22]">
                                {rec.title}
                              </span>
                              <Badge verdict={isHigh ? 'malicious' : isMedium ? 'suspicious' : 'unknown'} size="sm">
                                Priority: {rec.priority}
                              </Badge>
                            </div>
                            <p className="text-[#A4B8B5] light:text-[#4B6B67] text-[11px] leading-relaxed">
                              {rec.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#101C22] light:bg-[#E0F2ED] border border-[#24454C] light:border-[#C2E2DA] text-xs font-mono text-[#A4B8B5] light:text-[#4B6B67] text-center">
                    No defensive recommendations required for this destination.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="p-2 text-center text-[11px] font-mono text-[#A4B8B5] light:text-[#4B6B67] italic">
            {SIMULATION_DISCLAIMER}
          </div>
        </main>
      </div>
    </div>
  )
}
