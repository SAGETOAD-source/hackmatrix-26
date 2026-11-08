import { apiClient, isApiMode } from './api.js'
import { getSecurityAnalysis as getMockSecurityAnalysis } from '../utils/securityAnalysisData.js'

/**
 * Fetch live threat intelligence indicators from backend API: GET /api/v1/intelligence
 * @param {object} params Optional filters { type, severity }
 * @returns {Promise<Array>} List of threat intelligence indicators
 */
export async function fetchThreatIntelligence(params = {}) {
  try {
    const response = await apiClient.get('/intelligence', { params })
    return response.data?.data?.intelligence || []
  } catch (err) {
    console.warn('Threat intelligence feed unavailable:', err.message)
    return []
  }
}

/**
 * Fetch deep security & cryptographic analysis from Backend API or local mock engine
 * @param {string} target Domain name, URL, or numeric scan ID
 * @param {object} options Options ({ demoMode, scanId })
 * @returns {Promise<object>} Security analysis data
 */
export async function fetchSecurityAnalysis(target, options = {}) {
  const { demoMode = false, scanId = null } = options
  const cleanTarget = (target || 'github.com').trim()

  // 1. Live API Mode
  if (!demoMode && isApiMode()) {
    // If a specific scan ID was passed, fetch the real scan analysis from backend
    if (scanId || /^\d+$/.test(cleanTarget)) {
      const idToFetch = scanId || cleanTarget
      try {
        const response = await apiClient.get(`/scans/${idToFetch}`)
        const scan = response.data?.data?.scan
        if (scan && scan.analysis) {
          const analysis = scan.analysis
          return {
            domain: scan.url.replace(/^https?:\/\//, '').split('/')[0],
            cleanInput: scan.url,
            isHttps: scan.url.startsWith('https://'),
            isPhish: scan.verdict === 'Phishing' || scan.risk_score >= 60,
            isSuspicious: scan.verdict === 'Suspicious' || (scan.risk_score >= 30 && scan.risk_score < 60),
            certificate: analysis.ssl_status || analysis.certificate || null,
            httpHeaders: analysis.http_headers || analysis.httpHeaders || null,
            dns: analysis.dns || null,
            findings: analysis.suspicious_indicators || analysis.findings || [],
            simulatedDemo: false,
            isLiveApi: true,
            scanId: scan.id,
            status: scan.status,
            backendNotice: null,
          }
        }
      } catch (err) {
        console.warn(`Failed to retrieve scan #${idToFetch} from backend:`, err.message)
      }
    }

    // Also query live threat intelligence indicators from GET /api/v1/intelligence
    const liveIntel = await fetchThreatIntelligence()
    const matchingIntel = liveIntel.filter((i) =>
      i.indicator && (cleanTarget.includes(i.indicator) || i.indicator.includes(cleanTarget))
    )

    // Note: Backend does not have a standalone GET /api/v1/security/analyze endpoint.
    // We notify the caller that deep audit telemetry is bound to scan records.
    const mockBaseline = getMockSecurityAnalysis(cleanTarget)
    return {
      ...mockBaseline,
      simulatedDemo: false,
      isLiveApi: true,
      threatIntelligenceFeed: liveIntel,
      matchingIndicators: matchingIntel,
      backendNotice: 'Direct domain-level ad-hoc inspection is not an isolated endpoint in backend API gateway; telemetry is linked to scan records (/api/v1/scans). Live threat intel indicators loaded.',
    }
  }

  // 2. Demonstration mode: local calculations
  const mockData = getMockSecurityAnalysis(cleanTarget)
  return {
    ...mockData,
    simulatedDemo: true,
    isLiveApi: false,
  }
}

export default {
  fetchThreatIntelligence,
  fetchSecurityAnalysis,
}
