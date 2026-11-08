import { apiClient, isApiMode } from './api.js'
import {
  getScanHistory,
  deleteScanItem,
  clearScanHistory,
} from '../utils/scanStorage.js'
import { isAuthenticated } from './authService.js'

/**
 * Fetch scan history from backend API (GET /api/v1/scans) or local storage
 * @param {object} params Query parameters
 * @param {object} options Options ({ demoMode })
 * @returns {Promise<Array>} List of scan records
 */
export async function fetchHistory(params = {}, options = {}) {
  const { demoMode = false } = options

  if (!demoMode && isApiMode()) {
    if (!isAuthenticated()) {
      // User is not signed in to backend API; return local storage history with notice
      return getScanHistory().map((item) => ({
        ...item,
        authRequiredNotice: true,
      }))
    }

    try {
      // Backend endpoint: GET /api/v1/scans
      const response = await apiClient.get('/scans', { params })
      const rawScans = response.data?.data?.scans || []

      if (Array.isArray(rawScans)) {
        return rawScans.map((item) => {
          const domain = item.url ? item.url.replace(/^https?:\/\//, '').split('/')[0] : 'unknown'
          const riskScore = typeof item.risk_score === 'number' ? item.risk_score : 0
          const verdict = item.verdict || (riskScore >= 60 ? 'Phishing' : riskScore >= 30 ? 'Suspicious' : 'Safe')

          return {
            id: item.id,
            url: item.url,
            domain,
            prediction: verdict,
            verdict,
            riskLevel: item.risk_level || (riskScore >= 80 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH' : riskScore >= 30 ? 'SUSPICIOUS' : 'LOW'),
            riskScore,
            status: item.status,
            confidence: 0.94,
            timestamp: item.completed_at || item.created_at || new Date().toISOString(),
            formattedDate: new Date(item.completed_at || item.created_at || Date.now()).toLocaleDateString(),
            findings: [],
            simulatedDemo: false,
            isLiveApi: true,
          }
        })
      }
    } catch (err) {
      console.warn('Failed to fetch scans from backend API, falling back to local audit cache:', err.message)
      return getScanHistory()
    }
  }

  // Demonstration mode: read from localStorage
  return getScanHistory()
}

/**
 * Delete a single scan item from history
 * Note: Backend does NOT provide a DELETE /api/v1/scans/:id endpoint.
 * We remove from local audit storage and notify the caller.
 * @param {string|number} id Record identifier
 * @returns {Promise<{ success: boolean, backendSupported: boolean, updatedList: Array }>}
 */
export async function removeHistoryItem(id) {
  // Backend lacks DELETE endpoint per inspection
  const updatedList = deleteScanItem(id)
  return {
    success: true,
    backendSupported: false,
    message: 'Removed from local audit view. (Backend does not expose a DELETE /api/v1/scans endpoint).',
    updatedList,
  }
}

/**
 * Clear all scan history
 * Note: Backend does NOT provide a DELETE /api/v1/scans endpoint.
 * @returns {Promise<{ success: boolean, backendSupported: boolean }>}
 */
export async function clearAllHistory() {
  clearScanHistory()
  return {
    success: true,
    backendSupported: false,
    message: 'Local audit history cleared. (Backend does not expose a bulk DELETE endpoint).',
  }
}

/**
 * Export scan history to CSV file
 * @param {Array} scans List of scans to export
 */
export function exportHistoryCSV(scans = []) {
  if (!scans || scans.length === 0) return

  const headers = ['Scan ID', 'Target URL', 'Domain', 'Prediction', 'Risk Level', 'Risk Score', 'Status', 'Timestamp']
  const rows = scans.map((s) => [
    `"${s.id || ''}"`,
    `"${(s.url || '').replace(/"/g, '""')}"`,
    `"${s.domain || ''}"`,
    `"${s.prediction || s.verdict || ''}"`,
    `"${s.riskLevel || ''}"`,
    s.riskScore ?? 0,
    `"${s.status || 'completed'}"`,
    `"${s.timestamp || ''}"`,
  ])

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `phishguard-scan-audit-${Date.now()}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default {
  fetchHistory,
  removeHistoryItem,
  clearAllHistory,
  exportHistoryCSV,
}
