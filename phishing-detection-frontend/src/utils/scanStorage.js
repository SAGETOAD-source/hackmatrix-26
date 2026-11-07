/**
 * scanStorage.js - Scan History Management for ThreatSentinel SOC Demo
 * Handles persistence of simulated scans in localStorage/sessionStorage.
 */

import { RECENT_SCANS } from '../data/mockData.js'

const STORAGE_KEY = 'threat_sentinel_scan_history'

/**
 * Convert mock recent scan to standard format if needed
 */
function normalizeScan(item) {
  if (!item) return null

  const timestamp = item.timestamp || new Date().toISOString()
  const domain = item.domain || (item.url ? item.url.replace(/^https?:\/\//, '').split('/')[0] : 'unknown')

  return {
    id: item.id || `scn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    url: item.url || 'https://unknown.target',
    domain,
    prediction: item.prediction || 'Suspicious',
    riskLevel: item.riskLevel || 'SUSPICIOUS',
    riskScore: typeof item.riskScore === 'number' ? item.riskScore : 50,
    confidence: item.confidence || (item.mlConfidence ? item.mlConfidence / 100 : 0.95),
    timestamp,
    formattedDate: item.formattedDate || formatTimestamp(timestamp),
    findings: item.findings || item.indicators || [],
    simulatedDemo: true,
  }
}

function formatTimestamp(ts) {
  if (!ts) return 'Just now'
  if (ts.includes('ago') || ts.includes('Just now')) return ts

  try {
    const d = new Date(ts)
    if (isNaN(d.getTime())) return ts
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ts
  }
}

/**
 * Get initial seed data from RECENT_SCANS
 */
function getInitialSeed() {
  const now = Date.now()
  return RECENT_SCANS.map((scan, idx) => {
    // Generate dates spread across recent hours/days
    const dateOffset = idx * 18 * 60 * 1000 // 18 mins apart
    const scanDate = new Date(now - dateOffset)

    return {
      id: scan.id || `scn-seed-${idx}`,
      url: scan.url,
      domain: scan.domain,
      prediction: scan.prediction,
      riskLevel: scan.riskLevel,
      riskScore: scan.riskScore,
      confidence: (scan.mlConfidence || 95) / 100,
      timestamp: scanDate.toISOString(),
      formattedDate: scan.timestamp || scanDate.toLocaleDateString(),
      findings: scan.indicators || [],
      simulatedDemo: true,
    }
  })
}

/**
 * Retrieve scan history array safely
 */
export function getScanHistory() {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seed = getInitialSeed()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
      return seed
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      const seed = getInitialSeed()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
      return seed
    }

    return parsed.map(normalizeScan).filter(Boolean)
  } catch {
    return getInitialSeed()
  }
}

/**
 * Save completed scan to history
 */
export function saveScanToHistory(scan) {
  if (typeof window === 'undefined' || !scan) return

  try {
    const history = getScanHistory()

    const newEntry = {
      id: scan.id || `scn-${Date.now()}`,
      url: scan.url,
      domain: scan.domain || scan.url.replace(/^https?:\/\//, '').split('/')[0],
      prediction: scan.prediction || 'Suspicious',
      riskLevel: scan.riskLevel || 'SUSPICIOUS',
      riskScore: typeof scan.riskScore === 'number' ? scan.riskScore : 50,
      confidence: scan.confidence || 0.95,
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      findings: scan.suspiciousIndicators || scan.findings || [],
      simulatedDemo: true,
    }

    // Filter out immediate identical duplicate
    const filtered = history.filter((item) => item.url !== newEntry.url)
    const updated = [newEntry, ...filtered].slice(0, 50) // keep top 50

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return newEntry
  } catch {
    // quota exceeded or private mode
  }
}

/**
 * Delete a single scan item by ID
 */
export function deleteScanItem(id) {
  if (typeof window === 'undefined' || !id) return []

  try {
    const history = getScanHistory()
    const updated = history.filter((item) => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return []
  }
}

/**
 * Clear all scan history
 */
export function clearScanHistory() {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

