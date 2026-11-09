import test from 'node:test'
import assert from 'node:assert/strict'
import { simulateScan, isValidUrl } from '../utils/simulateScan.js'

test('Hyphen Detection and URL Handling', async (t) => {
  await t.test('accepts domain with hyphens without requiring https:// prefix', () => {
    const valid = isValidUrl('paypal-security-verification.com')
    assert.equal(valid.valid, true)
    assert.equal(valid.error, null)
  })

  await t.test('correctly counts hyphens on domain with multiple hyphens', () => {
    const scan = simulateScan('https://paypa1-security-verification-portal.com.tk/login')
    assert.equal(scan.urlCharacteristics.hyphenCount, 3)
    // Should trigger the excessive hyphens indicator
    const hasHyphenIndicator = scan.suspiciousIndicators.some((ind) =>
      ind.title.toLowerCase().includes('hyphen')
    )
    assert.equal(hasHyphenIndicator, true)
  })

  await t.test('clean domain with zero hyphens does not trigger hyphen indicator', () => {
    const scan = simulateScan('https://www.google.com/search')
    assert.equal(scan.urlCharacteristics.hyphenCount, 0)
    const hasHyphenIndicator = scan.suspiciousIndicators.some((ind) =>
      ind.title.toLowerCase().includes('hyphen')
    )
    assert.equal(hasHyphenIndicator, false)
  })
})
