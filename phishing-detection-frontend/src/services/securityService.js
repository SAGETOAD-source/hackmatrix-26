import { apiClient, isApiMode } from './api.js'
import { getSecurityAnalysis as getMockSecurityAnalysis } from '../utils/securityAnalysisData.js'

/**
 * Fetch deep security & cryptographic analysis either from Backend API or local mock engine
 * @param {string} target Domain name or URL
 * @param {object} options Options ({ forceApi, fallbackToMock })
 * @returns {Promise<object>} Security analysis data
 */
export async function fetchSecurityAnalysis(target, options = {}) {
  const { forceApi = false, fallbackToMock = true } = options
  const cleanTarget = (target || 'github.com').trim()

  if (isApiMode() || forceApi) {
    try {
      const response = await apiClient.get('/security/analyze', {
        params: { target: cleanTarget },
      })
      const data = response.data?.data || response.data || {}

      const mockFallback = getMockSecurityAnalysis(cleanTarget)

      return {
        domain: data.domain || mockFallback.domain,
        cleanInput: cleanTarget,
        isHttps: typeof data.is_https === 'boolean' ? data.is_https : mockFallback.isHttps,
        isPhish: typeof data.is_phish === 'boolean' ? data.is_phish : mockFallback.isPhish,
        isSuspicious: typeof data.is_suspicious === 'boolean' ? data.is_suspicious : mockFallback.isSuspicious,
        certificate: data.certificate || mockFallback.certificate,
        httpHeaders: data.http_headers || data.httpHeaders || mockFallback.httpHeaders,
        dns: data.dns || mockFallback.dns,
        findings: data.findings || mockFallback.findings,
        simulatedDemo: false,
        isLiveApi: true,
      }
    } catch (err) {
      if (!fallbackToMock) throw err
      return getMockSecurityAnalysis(cleanTarget)
    }
  }

  // Mock mode: local calculation
  return getMockSecurityAnalysis(cleanTarget)
}

export default {
  fetchSecurityAnalysis,
}
