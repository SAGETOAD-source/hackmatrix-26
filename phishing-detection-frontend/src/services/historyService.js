import { apiClient, isApiMode } from './api.js'
import {
  getScanHistory,
  deleteScanItem,
  clearScanHistory,
} from '../utils/scanStorage.js'

/**
 * Fetch scan history either from Backend API or local storage
 * @param {object} params Query parameters (search, limit, offset, filter)
 * @param {object} options Options ({ forceApi, fallbackToMock })
 * @returns {Promise<Array>} List of scan records
 */
export async function fetchHistory(params = {}, options = {}) {
  const { forceApi = false, fallbackToMock = true } = options

  if (isApiMode() || forceApi) {
    try {
      const response = await apiClient.get('/history', { params })
      const data = response.data?.data || response.data || []

      if (Array.isArray(data)) {
        return data.map((item) => ({
          id: item.id || `scn-${Date.now()}`,
          url: item.url,
          domain: item.domain || (item.url ? item.url.replace(/^https?:\/\//, '').split('/')[0] : 'unknown'),
          prediction: item.prediction || 'Suspicious',
          riskLevel: item.risk_level || item.riskLevel || 'SUSPICIOUS',
          riskScore: typeof item.risk_score === 'number' ? item.risk_score : item.riskScore || 50,
          confidence: item.confidence || 0.95,
          timestamp: item.timestamp || item.created_at || new Date().toISOString(),
          formattedDate: item.formattedDate || new Date(item.timestamp || Date.now()).toLocaleDateString(),
          findings: item.findings || item.indicators || [],
          simulatedDemo: false,
        }))
      }
      return getScanHistory()
    } catch (err) {
      if (!fallbackToMock) throw err
      return getScanHistory()
    }
  }

  // Mock mode: read from localStorage
  return getScanHistory()
}

/**
 * Delete a single scan item from history
 * @param {string} id Record identifier
 * @param {object} options Options
 * @returns {Promise<Array>} Updated history list
 */
export async function removeHistoryItem(id, options = {}) {
  const { forceApi = false, fallbackToMock = true } = options

  if (isApiMode() || forceApi) {
    try {
      await apiClient.delete(`/history/${encodeURIComponent(id)}`)
    } catch (err) {
      if (!fallbackToMock) throw err
    }
  }

  // Always keep local storage synchronized
  return deleteScanItem(id)
}

/**
 * Clear all scan history
 * @param {object} options Options
 * @returns {Promise<void>}
 */
export async function clearAllHistory(options = {}) {
  const { forceApi = false, fallbackToMock = true } = options

  if (isApiMode() || forceApi) {
    try {
      await apiClient.delete('/history')
    } catch (err) {
      if (!fallbackToMock) throw err
    }
  }

  clearScanHistory()
}

/**
 * Export scan history to CSV file
 * @param {Array} scans List of scans to export
 */
export function exportHistoryCSV(scans = []) {
  if (!scans || scans.length === 0) return

  const headers = ['Scan ID', 'Target URL', 'Domain', 'Prediction', 'Risk Level', 'Risk Score', 'Timestamp']
  const rows = scans.map((s) => [
    `"${s.id || ''}"`,
    `"${(s.url || '').replace(/"/g, '""')}"`,
    `"${s.domain || ''}"`,
    `"${s.prediction || ''}"`,
    `"${s.riskLevel || ''}"`,
    s.riskScore ?? 0,
    `"${s.timestamp || ''}"`,
  ])

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `threat-sentinel-scan-history-${Date.now()}.csv`
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
