import { apiClient, isApiMode } from './api.js'
import { simulateScan } from '../utils/simulateScan.js'
import { saveScanToHistory } from '../utils/scanStorage.js'

const LATEST_SCAN_KEY = 'latest_scan_result'

/**
 * Normalizes backend API response to the standard frontend result schema
 * @param {object} apiData Raw API payload
 * @param {string} targetUrl Original target URL
 * @returns {object} Standardized result object
 */
function normalizeApiResponse(apiData, targetUrl) {
  const data = apiData?.data || apiData || {}

  const prediction =
    data.prediction ||
    (data.risk_score >= 60 ? 'Phishing' : data.risk_score >= 30 ? 'Suspicious' : 'Legitimate')

  const riskScore =
    typeof data.risk_score === 'number'
      ? data.risk_score
      : typeof data.riskScore === 'number'
      ? data.riskScore
      : 50

  const riskLevel =
    data.risk_level ||
    data.riskLevel ||
    (riskScore >= 80
      ? 'CRITICAL'
      : riskScore >= 60
      ? 'HIGH'
      : riskScore >= 30
      ? 'SUSPICIOUS'
      : 'LOW')

  const confidence =
    typeof data.confidence === 'number'
      ? data.confidence
      : typeof data.ml_confidence === 'number'
      ? data.ml_confidence / 100
      : 0.95

  const domain =
    data.domain ||
    targetUrl.replace(/^https?:\/\//, '').split('/')[0]

  // Fallback to mock baseline for nested schemas if API doesn't provide them
  const mockBaseline = simulateScan(targetUrl)

  return {
    url: targetUrl,
    domain,
    timestamp: data.timestamp || new Date().toISOString(),
    simulatedDemo: false,
    isLiveApi: true,
    prediction,
    riskScore,
    riskLevel,
    confidence,
    urlCharacteristics: data.url_characteristics || data.urlCharacteristics || mockBaseline.urlCharacteristics,
    sslStatus: data.ssl_status || data.sslStatus || mockBaseline.sslStatus,
    httpHeaders: data.http_headers || data.httpHeaders || mockBaseline.httpHeaders,
    suspiciousIndicators:
      data.suspicious_indicators ||
      data.suspiciousIndicators ||
      data.findings ||
      mockBaseline.suspiciousIndicators,
    recommendations: data.recommendations || mockBaseline.recommendations,
    componentScores:
      data.component_scores ||
      data.componentScores ||
      mockBaseline.componentScores,
  }
}

/**
 * Perform a URL scan either via live Backend API or local mock engine
 * @param {string} url The target URL
 * @param {object} options Configuration options ({ forceApi, fallbackToMock })
 * @returns {Promise<object>} The scan result
 */
export async function scanUrl(url, options = {}) {
  const { forceApi = false, fallbackToMock = true } = options
  const trimmed = url.trim()

  // 1. Live API Mode
  if (isApiMode() || forceApi) {
    try {
      // Primary API endpoint: POST /scan, payload: { url }
      const response = await apiClient.post('/scan', { url: trimmed })
      const normalized = normalizeApiResponse(response.data, trimmed)

      // Cache and record
      setLatestScan(normalized)
      saveScanToHistory(normalized)
      return normalized
    } catch (apiError) {
      if (!fallbackToMock) {
        throw apiError
      }

      // Fallback to simulated scan when API is unreachable
      const mockResult = simulateScan(trimmed)
      const fallbackResult = {
        ...mockResult,
        apiFallback: true,
        apiErrorMessage: apiError.message || 'Backend service unreachable',
      }
      setLatestScan(fallbackResult)
      saveScanToHistory(fallbackResult)
      return fallbackResult
    }
  }

  // 2. Mock / Demonstration Mode (default)
  const result = simulateScan(trimmed)
  setLatestScan(result)
  saveScanToHistory(result)
  return result
}

/**
 * Retrieve the latest scan result from sessionStorage
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
 * Save latest scan result to sessionStorage
 * @param {object} result
 */
export function setLatestScan(result) {
  if (typeof window === 'undefined' || !result) return
  try {
    sessionStorage.setItem(LATEST_SCAN_KEY, JSON.stringify(result))
  } catch {
    // Quota exceeded or private browsing
  }
}

export default {
  scanUrl,
  getLatestScan,
  setLatestScan,
}
