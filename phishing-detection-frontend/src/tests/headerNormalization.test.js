import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  normalizeHttpHeaders,
  normalizeFindings,
  normalizeRecommendations,
  ensureArray,
  formatHeaderName,
} from '../utils/headerNormalization.js'

describe('HTTP Headers and Telemetry Normalization', () => {
  // Test 1: Valid header array
  it('handles valid array of header objects', () => {
    const validArray = [
      { name: 'Content-Security-Policy', present: true, value: "default-src 'self'", severity: 'PASS' },
      { name: 'Strict-Transport-Security', present: true, value: 'max-age=31536000', severity: 'PASS' },
      { name: 'X-Frame-Options', present: false, value: 'Not set', severity: 'WARN' },
    ]
    const result = normalizeHttpHeaders(validArray)
    assert(Array.isArray(result), 'Result must be an array')
    assert.strictEqual(result.length, 3)
    assert.strictEqual(result[0].name, 'Content-Security-Policy')
    assert.strictEqual(result[0].present, true)
    assert.strictEqual(result[0].severity, 'PASS')
    assert.strictEqual(result[2].present, false)
    assert.strictEqual(result[2].severity, 'WARN')
  })

  // Test 2: Header object (Backend audit object and plain dictionary)
  it('handles backend inspection result object', () => {
    const backendObj = {
      finalUrl: 'https://paypal.com',
      statusCode: 200,
      redirects: [],
      headers: {
        'content-type': 'text/html; charset=UTF-8',
        'strict-transport-security': 'max-age=31536000; includeSubDomains',
        'x-frame-options': 'SAMEORIGIN',
        'server': 'cloudflare',
      },
      hsts: true,
      csp: false,
      xFrameOptions: 'SAMEORIGIN',
      xContentTypeOptions: null,
      referrerPolicy: null,
    }
    const result = normalizeHttpHeaders(backendObj)
    assert(Array.isArray(result), 'Result must be an array')
    assert(result.length >= 4, 'Must extract audited + observed headers')

    const hsts = result.find((h) => h.name === 'Strict-Transport-Security')
    assert(hsts, 'Strict-Transport-Security must exist')
    assert.strictEqual(hsts.present, true)
    assert.strictEqual(hsts.severity, 'PASS')

    const csp = result.find((h) => h.name === 'Content-Security-Policy')
    assert(csp, 'Content-Security-Policy must exist')
    assert.strictEqual(csp.present, false)
    assert.strictEqual(csp.severity, 'FAIL')

    const server = result.find((h) => h.name === 'Server')
    assert(server, 'Server header must exist')
    assert.strictEqual(server.value, 'cloudflare')
    assert.strictEqual(server.present, true)
  })

  it('handles plain dictionary of headers', () => {
    const plainHeaderDict = {
      'content-type': 'text/html',
      'server': 'nginx',
      'x-custom-security-token': 'verified',
    }
    const result = normalizeHttpHeaders(plainHeaderDict)
    assert(Array.isArray(result))
    assert.strictEqual(result.length, 3)
    assert(result.some((h) => h.name === 'Content-Type' && h.value === 'text/html'))
    assert(result.some((h) => h.name === 'Server' && h.value === 'nginx'))
    assert(result.some((h) => h.name === 'X-Custom-Security-Token' && h.value === 'verified'))
  })

  // Test 3: Empty headers (both empty array and empty object)
  it('handles empty array and empty object without errors', () => {
    const emptyArrayResult = normalizeHttpHeaders([])
    const emptyObjResult = normalizeHttpHeaders({})
    assert(Array.isArray(emptyArrayResult) && emptyArrayResult.length === 0)
    assert(Array.isArray(emptyObjResult) && emptyObjResult.length === 0)
  })

  // Test 4: Null headers
  it('handles null and undefined safely', () => {
    const nullResult = normalizeHttpHeaders(null)
    const undefinedResult = normalizeHttpHeaders(undefined)
    assert(Array.isArray(nullResult) && nullResult.length === 0)
    assert(Array.isArray(undefinedResult) && undefinedResult.length === 0)
  })

  // Test 5: Missing httpHeaders property on scan result
  it('handles scan result missing the httpHeaders property', () => {
    const scanRecord = { url: 'https://example.com', riskScore: 10 }
    const result = normalizeHttpHeaders(scanRecord.httpHeaders)
    assert(Array.isArray(result) && result.length === 0)
  })

  // Test 6: Unexpected primitive types
  it('handles unexpected primitives without crashing', () => {
    assert.deepStrictEqual(normalizeHttpHeaders('invalid string'), [])
    assert.deepStrictEqual(normalizeHttpHeaders(12345), [])
    assert.deepStrictEqual(normalizeHttpHeaders(true), [])
  })

  // Auxiliary Collections (findings and recommendations)
  it('safely normalizes suspicious indicators and findings', () => {
    const objFindings = {
      f1: 'High entropy domain structure detected',
      f2: { title: 'Punycode Spoofing', severity: 'CRITICAL', details: 'xn--...' },
    }
    const res = normalizeFindings(objFindings)
    assert(Array.isArray(res))
    assert.strictEqual(res.length, 2)
    assert.strictEqual(res[0].title, 'f1')
    assert.strictEqual(res[1].title, 'Punycode Spoofing')
    assert.strictEqual(res[1].severity, 'FAIL')
  })

  it('safely normalizes recommendations arrays and objects', () => {
    const mixedRecs = ['Enforce Strict-Transport-Security header.', { title: 'Implement CSP', priority: 'HIGH' }]
    const res = normalizeRecommendations(mixedRecs)
    assert(Array.isArray(res))
    assert.strictEqual(res.length, 2)
    assert.strictEqual(res[0].title, 'Enforce Strict-Transport-Security header.')
    assert.strictEqual(res[1].priority, 'HIGH')
  })
})

