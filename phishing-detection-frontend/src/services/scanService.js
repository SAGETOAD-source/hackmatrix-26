import { apiClient, isApiMode } from './api.js'
import { simulateScan } from '../utils/simulateScan.js'
import { saveScanToHistory } from '../utils/scanStorage.js'
import { isAuthenticated } from './authService.js'

const LATEST_SCAN_KEY = 'latest_scan_result'

function normalizeHeaders(h) {
  if (Array.isArray(h)) return h
  if (!h || typeof h !== 'object' || h.error) return []
  const rows = [
    ['Strict-Transport-Security', h.hsts ? 'Enabled' : null, 'WARN'],
    ['Content-Security-Policy', h.csp ? 'Set' : null, 'FAIL'],
    ['X-Frame-Options', h.xFrameOptions, 'WARN'],
    ['X-Content-Type-Options', h.xContentTypeOptions, 'FAIL'],
    ['Referrer-Policy', h.referrerPolicy, 'WARN'],
  ]
  return rows.map(([name, value, sev]) => ({
    name,
    present: Boolean(value),
    value: value || 'Not set',
    severity: value ? 'PASS' : sev,
  }))
}

function shannonEntropy(s) {
  if (!s) return 0
  const f = {}
  for (const c of s) f[c] = (f[c] || 0) + 1
  let e = 0
  for (const k in f) {
    const p = f[k] / s.length
    e -= p * Math.log2(p)
  }
  return Number(e.toFixed(2))
}

const RISKY_TLDS = new Set(['xyz','top','tk','ml','ga','cf','gq','click','link','work','zip','country','kim','loan'])
const SHORTENERS = new Set(['bit.ly','tinyurl.com','t.co','goo.gl','ow.ly','is.gd','buff.ly','cutt.ly','rebrand.ly'])
const LURE_WORDS = ['login','verify','secure','account','update','banking','confirm','signin','password','wallet']

function buildUrlCharacteristics(backendChars, targetUrl) {
  const b = backendChars && typeof backendChars === 'object' ? backendChars : {}
  let u = null
  try {
    u = new URL(/^https?:\/\//i.test(targetUrl) ? targetUrl : `https://${targetUrl}`)
  } catch {
    u = null
  }
  const host = u ? u.hostname.toLowerCase() : ''
  const path = u ? u.pathname : ''
  const query = u ? u.search.replace(/^\?/, '') : ''
  const tld = host.split('.').pop()
  const lure = LURE_WORDS.filter((k) => targetUrl.toLowerCase().includes(k))
  return {
    urlLength: b.urlLength ?? targetUrl.length,
    domainLength: b.domainLength ?? host.length,
    dotCount: (host.match(/\./g) || []).length,
    hyphenCount: (host.match(/-/g) || []).length,
    specialCharCount: (targetUrl.match(/[^a-zA-Z0-9.:/]/g) || []).length,
    subdomainCount: b.subdomainCount ?? Math.max(0, host.split('.').length - 2),
    hasIPAddress: b.hasIpAddress ?? /^(\d{1,3}\.){3}\d{1,3}$/.test(host),
    hasAtSymbol: b.hasAtSymbol ?? targetUrl.includes('@'),
    hasSuspiciousEncoding: /%[0-9a-f]{2}/i.test(targetUrl),
    isHTTPS: b.hasHttps ?? (u ? u.protocol === 'https:' : false),
    pathLength: path.length,
    queryParamCount: query ? query.split('&').length : 0,
    suspiciousTLD: b.hasSuspiciousTld ?? RISKY_TLDS.has(tld),
    domainEntropy: shannonEntropy(host),
    hasPunycode: host.includes('xn--'),
    suspiciousPort: Boolean(u && u.port && !['80', '443'].includes(u.port)),
    isURLShortener: b.isShortened ?? SHORTENERS.has(host),
    suspiciousKeywords: Array.isArray(b.matchedKeywords) ? b.matchedKeywords : lure,
  }
}

function normalizeSsl(t, domain) {
  if (!t || typeof t !== 'object') return { hasSSL: false, domain }
  if (typeof t.hasSSL === 'boolean') return { ...t, domain: t.domain || domain }
  const hasCert = ['valid', 'expired', 'untrusted'].includes(t.status)
  return {
    hasSSL: hasCert,
    protocol: 'TLS',
    live: true,
    authorized: Boolean(t.authorized),
    daysRemaining: typeof t.daysRemaining === 'number' ? t.daysRemaining : null,
    issuer: t.issuer || null,
    validFrom: t.validFrom ? String(t.validFrom).slice(0, 10) : null,
    validTo: t.validTo ? String(t.validTo).slice(0, 10) : null,
    sanMatch: Boolean(t.authorized),
    ctLogged: null,
    grade: t.valid ? undefined : 'F',
    domain,
  }
}

function normalizeRecs(recs) {
  if (!Array.isArray(recs)) return []
  return recs.map((r) => {
    if (r && typeof r === 'object') return r
    const text = String(r)
    const priority = /extreme caution|phishing campaign/i.test(text) ? 'HIGH' : /https|hsts|cleartext/i.test(text) ? 'MEDIUM' : 'LOW'
    const title = priority === 'HIGH' ? 'Immediate action' : priority === 'MEDIUM' ? 'Recommended hardening' : 'Further verification'
    return { title, description: text, priority }
  })
}

/**
 * Normalizes live backend scan record to the standard frontend result schema
 * @param {object} scan The scan record from backend (GET /api/v1/scans/:id)
 * @param {string} targetUrl Original URL
 * @returns {object} Standardized live result object
 */
function normalizeLiveScan(scan, targetUrl) {
  const analysis = scan.analysis || {}

  const riskScore = typeof scan.risk_score === 'number'
    ? scan.risk_score
    : typeof scan.riskScore === 'number'
    ? scan.riskScore
    : (scan.status === 'completed' ? 0 : null)

  const riskLevel = scan.risk_level || scan.riskLevel || (
    riskScore !== null
      ? (riskScore >= 80 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH' : riskScore >= 30 ? 'SUSPICIOUS' : 'LOW')
      : 'PENDING'
  )

  const verdict = scan.verdict || (
    riskScore !== null
      ? (riskScore >= 60 ? 'Phishing' : riskScore >= 30 ? 'Suspicious' : 'Safe')
      : 'Pending Analysis'
  )

  const domain = scan.url
    ? scan.url.replace(/^https?:\/\//, '').split('/')[0]
    : targetUrl.replace(/^https?:\/\//, '').split('/')[0]

  // Construct real URL characteristics parsed directly from the target
  let parsedUrl
  try {
    parsedUrl = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`)
  } catch {
    parsedUrl = { hostname: domain, pathname: '/', protocol: 'https:' }
  }

  const realUrlChars = analysis.url_characteristics || analysis.urlCharacteristics || {
    urlLength: targetUrl.length,
    domainLength: domain.length,
    subdomainCount: domain.split('.').length > 2 ? domain.split('.').length - 2 : 0,
    hasHttps: parsedUrl.protocol === 'https:',
    hasIpAddress: /^(\d{1,3}\.){3}\d{1,3}$/.test(parsedUrl.hostname),
    hasAtSymbol: targetUrl.includes('@'),
    hasSuspiciousKeyword: /(login|verify|secure|account|update|banking|confirm)/i.test(targetUrl),
    entropy: analysis.entropy ?? null,
  }

  return {
    id: scan.id,
    url: scan.url || targetUrl,
    domain,
    timestamp: scan.completed_at || scan.created_at || new Date().toISOString(),
    status: scan.status, // 'pending' | 'completed' | 'failed'
    simulatedDemo: false,
    isLiveApi: true,
    prediction: verdict,
    verdict,
    riskScore: riskScore ?? 0,
    riskLevel,
    confidence: typeof analysis.ml_analysis?.confidence === 'number'
      ? analysis.ml_analysis.confidence
      : typeof analysis.confidence === 'number'
      ? analysis.confidence
      : typeof scan.confidence === 'number'
      ? scan.confidence
      : 0.94,
    mlAnalysis: analysis.ml_analysis || null,
    urlCharacteristics: buildUrlCharacteristics(realUrlChars, scan.url || targetUrl),
    sslStatus: normalizeSsl(analysis.ssl_status || analysis.sslStatus || analysis.certificate, domain),
    httpHeaders: normalizeHeaders(analysis.http_headers || analysis.httpHeaders),
    dns: analysis.dns || null,
    suspiciousIndicators: analysis.suspicious_indicators || analysis.findings || [],
    recommendations: normalizeRecs(analysis.recommendations || [
      'Analyze SSL/TLS certificate chain for unauthorized root authorities.',
      'Check URL against commercial and open-source threat intelligence feeds.',
      'Inspect HTTP response headers for missing HSTS, CSP, and X-Frame-Options.',
    ]),
    componentScores: analysis.component_scores || {
      lexical: analysis.lexical_score ?? Math.min(riskScore ?? 0, 85),
      tls: analysis.tls_score ?? Math.min(riskScore ?? 0, 70),
      dns: analysis.dns_score ?? Math.min(riskScore ?? 0, 60),
      heuristics: analysis.heuristics_score ?? Math.min(riskScore ?? 0, 75),
      threatIntel: analysis.threat_intel_score ?? (riskScore > 50 ? 80 : 10),
    },
    rawBackendData: scan,
  }
}

/**
 * Polls backend for scan completion: GET /api/v1/scans/:id
 * @param {string|number} scanId Numeric scan ID
 * @param {string} targetUrl Target URL
 * @param {Function} onProgress Optional callback for progress state
 * @param {number} maxWaitMs Maximum polling timeout in ms (default 20000)
 * @returns {Promise<object>} Completed scan record
 */
async function pollScanResult(scanId, targetUrl, onProgress = null, maxWaitMs = 20000) {
  const startTime = Date.now()
  const interval = 1500 // poll every 1.5s
  let attempts = 0

  while (Date.now() - startTime < maxWaitMs) {
    attempts += 1
    if (onProgress) {
      const elapsed = Math.round((Date.now() - startTime) / 1000)
      onProgress({
        attempt: attempts,
        elapsedSeconds: elapsed,
        stage: elapsed < 3 ? 'Analyzing lexical & TLS posture...' : elapsed < 6 ? 'Querying DNS zone records & headers...' : 'Evaluating threat intelligence models...',
      })
    }

    try {
      const response = await apiClient.get(`/scans/${scanId}`)
      const scan = response.data?.data?.scan

      if (scan) {
        if (scan.status === 'completed') {
          return normalizeLiveScan(scan, targetUrl)
        }

        if (scan.status === 'failed') {
          throw new Error(scan.error_message || 'Backend scan failed during analysis.')
        }
      }
    } catch (err) {
      // If error is 404 or network glitch, retry if within time limit
      if (err.status && err.status !== 404) {
        throw err
      }
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, interval))
  }

  // If poll times out while still pending, fetch one last time to capture the pending scan
  try {
    const finalCheck = await apiClient.get(`/scans/${scanId}`)
    const scan = finalCheck.data?.data?.scan
    if (scan) {
      if (scan.status === 'completed') {
        return normalizeLiveScan(scan, targetUrl)
      }
      const pendingResult = normalizeLiveScan(scan, targetUrl)
      pendingResult.isPending = true
      pendingResult.pendingNotice = `Scan #${scanId} submitted successfully. Backend analysis is still processing.`
      return pendingResult
    }
  } catch {
    // ignore
  }

  throw new Error(`Scan #${scanId} timed out after ${Math.round(maxWaitMs / 1000)}s while waiting for backend processing.`)
}

/**
 * Perform a URL scan via live backend API or demonstration mode
 * @param {string} url Target URL
 * @param {object} options Configuration options ({ demoMode, onProgress })
 * @returns {Promise<object>} The scan result
 */
export async function scanUrl(url, options = {}) {
  const { demoMode = false, onProgress = null } = options
  const trimmed = url.trim()

  if (!trimmed) {
    throw new Error('Please enter a target URL to scan.')
  }

  // 1. Explicit or global Demo Mode
  if (demoMode || !isApiMode()) {
    const result = simulateScan(trimmed)
    result.simulatedDemo = true
    result.isLiveApi = false
    setLatestScan(result)
    saveScanToHistory(result)
    return result
  }

  // 2. Live API Mode: POST /api/v1/scans
  if (isApiMode()) {
    // Check if user has an auth token (required by backend scan.routes.js)
    if (!isAuthenticated()) {
      throw {
        message: 'Analyst authentication required to submit live scans to the backend API. Please sign in via the Analyst profile or switch to Demo Mode.',
        status: 401,
        isAuthRequired: true,
      }
    }

    // Submit URL to backend: POST /api/v1/scans
    const submitResponse = await apiClient.post('/scans', { url: trimmed })

    const createdScan = submitResponse.data?.data?.scan
    if (!createdScan || !createdScan.id) {
      throw new Error('Backend did not return a valid scan ticket ID.')
    }

    // Poll for analysis completion
    const finalResult = await pollScanResult(createdScan.id, trimmed, onProgress)

    setLatestScan(finalResult)
    saveScanToHistory(finalResult)
    return finalResult
  }
}

/**
 * Retrieve latest scan from sessionStorage
 * @returns {object|null}
 */
export function getLatestScan() {
  if (typeof window === 'undefined') return null
  try {
    const stored = sessionStorage.getItem(LATEST_SCAN_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

/**
 * Save latest scan to sessionStorage
 * @param {object} result
 */
export function setLatestScan(result) {
  if (typeof window === 'undefined' || !result) return
  try {
    sessionStorage.setItem(LATEST_SCAN_KEY, JSON.stringify(result))
  } catch {
    // Quota exceeded
  }
}

export default {
  scanUrl,
  getLatestScan,
  setLatestScan,
}
