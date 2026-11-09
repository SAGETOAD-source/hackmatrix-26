/**
 * ThreatLens Header & Telemetry Normalization Utility
 *
 * Normalizes HTTP security response headers and analysis collections from:
 * - Arrays of header objects [{ name, present, value, severity }]
 * - Backend inspectHttpHeaders result objects { finalUrl, statusCode, headers: {...}, hsts, csp, ... }
 * - Plain key-value objects { "content-type": "text/html", "server": "nginx" }
 * - null, undefined, or unexpected types without throwing errors.
 */

/**
 * Format header key to standard HTTP casing (e.g. content-type -> Content-Type)
 * @param {string} name
 * @returns {string}
 */
export function formatHeaderName(name) {
  if (!name || typeof name !== 'string') return 'Unknown-Header'
  return name
    .split('-')
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ''))
    .join('-')
}

/**
 * Normalize severity status into standard PASS | WARN | FAIL
 * @param {string} sev
 * @returns {'PASS' | 'WARN' | 'FAIL'}
 */
export function normalizeSeverity(sev) {
  if (!sev) return 'PASS'
  const upper = String(sev).toUpperCase()
  if (upper === 'PASS' || upper === 'GOOD' || upper === 'SECURE' || upper === 'SAFE' || upper === 'LOW') {
    return 'PASS'
  }
  if (upper === 'WARN' || upper === 'WARNING' || upper === 'MEDIUM' || upper === 'SUSPICIOUS') {
    return 'WARN'
  }
  if (upper === 'FAIL' || upper === 'CRITICAL' || upper === 'HIGH' || upper === 'MISSING' || upper === 'MALICIOUS') {
    return 'FAIL'
  }
  return 'PASS'
}

/**
 * Normalizes HTTP security headers from any format into a guaranteed array of:
 * {
 *   name: string,
 *   value: string,
 *   present: boolean,
 *   severity: 'PASS' | 'WARN' | 'FAIL',
 *   status: string,
 *   statusBadge: string,
 *   explanation?: string,
 *   recommendation?: string
 * }
 *
 * @param {any} rawHeaders
 * @returns {Array<object>}
 */
export function normalizeHttpHeaders(rawHeaders) {
  if (!rawHeaders) return []

  // Case 1: Already an Array
  if (Array.isArray(rawHeaders)) {
    return rawHeaders
      .filter((item) => item !== null && item !== undefined)
      .map((item, idx) => {
        if (typeof item === 'string') {
          const colonIdx = item.indexOf(':')
          const name = colonIdx > -1 ? item.slice(0, colonIdx).trim() : `Header-${idx + 1}`
          const value = colonIdx > -1 ? item.slice(colonIdx + 1).trim() : item.trim()
          return {
            name: formatHeaderName(name),
            value,
            present: Boolean(value),
            severity: 'PASS',
            status: 'PASS',
            statusBadge: 'PASS',
          }
        }
        if (typeof item === 'object') {
          const name = item.name || item.header || item.key || `Header #${idx + 1}`
          const value = item.value !== undefined ? String(item.value) : (item.explanation || '')
          const present = typeof item.present === 'boolean'
            ? item.present
            : Boolean(value && value !== 'Not set')
          const severity = normalizeSeverity(item.severity || item.status || (present ? 'PASS' : 'WARN'))
          return {
            name,
            value,
            present,
            severity,
            status: severity,
            statusBadge: severity,
            explanation: item.explanation,
            recommendation: item.recommendation,
          }
        }
        return null
      })
      .filter(Boolean)
  }

  // Case 2: Object
  if (typeof rawHeaders === 'object') {
    const isBackendAuditObj =
      'hsts' in rawHeaders ||
      'csp' in rawHeaders ||
      'xFrameOptions' in rawHeaders ||
      'xContentTypeOptions' in rawHeaders ||
      (rawHeaders.headers && typeof rawHeaders.headers === 'object')

    const headersMap =
      rawHeaders.headers && typeof rawHeaders.headers === 'object'
        ? rawHeaders.headers
        : rawHeaders

    const list = []
    const seen = new Set()

    // If backend audit flags are available, map analyzed defensive security headers first
    if (isBackendAuditObj) {
      const audited = [
        { key: 'strict-transport-security', name: 'Strict-Transport-Security', defaultSev: 'FAIL', boolKey: 'hsts' },
        { key: 'content-security-policy', name: 'Content-Security-Policy', defaultSev: 'FAIL', boolKey: 'csp' },
        { key: 'x-frame-options', name: 'X-Frame-Options', defaultSev: 'WARN', valKey: 'xFrameOptions' },
        { key: 'x-content-type-options', name: 'X-Content-Type-Options', defaultSev: 'WARN', valKey: 'xContentTypeOptions' },
        { key: 'referrer-policy', name: 'Referrer-Policy', defaultSev: 'WARN', valKey: 'referrerPolicy' },
      ]

      for (const item of audited) {
        seen.add(item.key)
        let val = headersMap[item.key] || headersMap[item.key.toLowerCase()]
        let present = Boolean(val)

        if (item.boolKey && typeof rawHeaders[item.boolKey] === 'boolean') {
          present = rawHeaders[item.boolKey]
        } else if (item.valKey && rawHeaders[item.valKey]) {
          present = true
          val = val || rawHeaders[item.valKey]
        }

        const severity = present ? 'PASS' : item.defaultSev

        list.push({
          name: item.name,
          value: present ? (val || 'Configured') : 'Not set',
          present,
          severity,
          status: severity,
          statusBadge: severity,
          explanation: present ? `Observed header configured on destination.` : `Header missing from HTTP response.`,
          recommendation: present ? undefined : `Configure ${item.name} to mitigate OWASP transport vulnerabilities.`,
        })
      }
    }

    // Ignore backend execution meta fields
    const metaKeys = new Set([
      'finalurl',
      'statuscode',
      'redirects',
      'headers',
      'hsts',
      'csp',
      'xframeoptions',
      'xcontenttypeoptions',
      'referrerpolicy',
      'error',
      'simulateddemo',
      'isliveapi',
      'backendnotice',
    ])

    // Include all other observed headers from the response
    for (const [key, val] of Object.entries(headersMap)) {
      const lower = key.toLowerCase()
      if (seen.has(lower)) continue
      if (metaKeys.has(lower) && !rawHeaders.headers) continue
      if (typeof val === 'function' || val === undefined) continue

      const strVal = typeof val === 'string' ? val : JSON.stringify(val)
      list.push({
        name: formatHeaderName(key),
        value: strVal,
        present: Boolean(strVal && strVal !== 'Not set'),
        severity: 'PASS',
        status: 'PASS',
        statusBadge: 'PASS',
        explanation: strVal,
        recommendation: undefined,
      })
    }

    return list
  }

  // Case 3: Other unexpected primitives
  return []
}

/**
 * Guarantees input is converted into a safe Array.
 * @param {any} val
 * @returns {Array}
 */
export function ensureArray(val) {
  if (Array.isArray(val)) return val
  if (val && typeof val === 'object') {
    return Object.values(val)
  }
  return []
}

/**
 * Normalizes findings/indicators collection safely
 * @param {any} findings
 * @returns {Array<object>}
 */
export function normalizeFindings(findings) {
  if (!findings) return []
  if (Array.isArray(findings)) {
    return findings
      .filter((item) => item !== null && item !== undefined)
      .map((item, idx) => {
        if (typeof item === 'string') {
          return {
            id: `finding-${idx}`,
            title: item,
            severity: 'WARN',
            description: item,
          }
        }
        if (typeof item === 'object') {
          return {
            id: item.id || `finding-${idx}`,
            title: item.title || item.name || item.type || 'Security Finding',
            severity: normalizeSeverity(item.severity || item.level || 'WARN'),
            description: item.description || item.explanation || item.details || '',
            details: item.details,
            recommendedAction: item.recommendedAction || item.recommendation || item.remediation,
          }
        }
        return null
      })
      .filter(Boolean)
  }
  if (typeof findings === 'object') {
    return Object.entries(findings)
      .map(([key, val], idx) => {
        if (typeof val === 'string') {
          return {
            id: `finding-${idx}`,
            title: key,
            severity: 'WARN',
            description: val,
          }
        }
        if (typeof val === 'object' && val !== null) {
          return {
            id: val.id || `finding-${idx}`,
            title: val.title || key,
            severity: normalizeSeverity(val.severity || 'WARN'),
            description: val.description || '',
            details: val.details,
          }
        }
        return null
      })
      .filter(Boolean)
  }
  return []
}

/**
 * Normalizes security recommendations collection safely
 * @param {any} recs
 * @returns {Array<object>}
 */
export function normalizeRecommendations(recs) {
  if (!recs) return []
  const arr = Array.isArray(recs) ? recs : typeof recs === 'object' ? Object.values(recs) : [recs]
  return arr
    .filter((item) => item !== null && item !== undefined)
    .map((rec, idx) => {
      if (typeof rec === 'string') {
        return {
          title: rec,
          priority: idx === 0 ? 'HIGH' : idx === 1 ? 'MEDIUM' : 'LOW',
          description: 'Recommended security mitigation.',
        }
      }
      if (typeof rec === 'object') {
        const priority = String(
          rec.priority || rec.severity || (idx === 0 ? 'HIGH' : idx === 1 ? 'MEDIUM' : 'LOW')
        ).toUpperCase()
        return {
          title: rec.title || rec.action || rec.recommendation || `Recommendation #${idx + 1}`,
          priority: priority === 'CRITICAL' ? 'HIGH' : priority,
          description: rec.description || rec.details || rec.explanation || 'Recommended security mitigation.',
        }
      }
      return null
    })
    .filter(Boolean)
}

export default {
  formatHeaderName,
  normalizeSeverity,
  normalizeHttpHeaders,
  ensureArray,
  normalizeFindings,
  normalizeRecommendations,
}

