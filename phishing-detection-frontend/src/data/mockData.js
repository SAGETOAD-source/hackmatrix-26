/**
 * SIMULATED THREAT INTELLIGENCE AND SCAN TELEMETRY DATA
 * NOTE: All data below is clearly labelled simulated telemetry for demonstration purposes.
 */

export const SIMULATION_DISCLAIMER =
  'Simulated Security Telemetry: Demonstrating platform visualization & SOC analysis workflows.'

export const STAT_CARDS_DATA = [
  {
    id: 'total-scans',
    title: 'Total Scans',
    value: '24,892',
    change: '+14.2%',
    trend: 'up',
    description: 'Past 30 days throughput',
    type: 'primary',
  },
  {
    id: 'phishing-detected',
    title: 'Phishing Detected',
    value: '2,140',
    change: '+8.7%',
    trend: 'up',
    description: 'Active malicious attacks intercepted',
    type: 'danger',
  },
  {
    id: 'safe-websites',
    title: 'Safe Websites',
    value: '20,830',
    change: '+18.1%',
    trend: 'up',
    description: 'Verified legitimate web domains',
    type: 'success',
  },
  {
    id: 'suspicious-websites',
    title: 'Suspicious Websites',
    value: '1,922',
    change: '-3.4%',
    trend: 'down',
    description: 'Anomalous lexical & header profiles',
    type: 'warning',
  },
]

export const SCAN_ACTIVITY_DATA = [
  { day: 'Mon', safe: 420, suspicious: 38, phishing: 45 },
  { day: 'Tue', safe: 510, suspicious: 42, phishing: 58 },
  { day: 'Wed', safe: 680, suspicious: 65, phishing: 82 },
  { day: 'Thu', safe: 590, suspicious: 49, phishing: 64 },
  { day: 'Fri', safe: 780, suspicious: 84, phishing: 98 },
  { day: 'Sat', safe: 430, suspicious: 30, phishing: 41 },
  { day: 'Sun', safe: 390, suspicious: 25, phishing: 36 },
]

export const THREAT_DISTRIBUTION_DATA = [
  { name: 'Credential Harvesting', value: 38, color: '#ef4444' },
  { name: 'Fake Banking & Payment', value: 26, color: '#f97316' },
  { name: 'Brand Impersonation', value: 18, color: '#eab308' },
  { name: 'Malware Distribution', value: 11, color: '#8b5cf6' },
  { name: 'Typosquatting & IDN', value: 7, color: '#06b6d4' },
]

export const RECENT_SCANS = [
  {
    id: 'scn-9021',
    url: 'http://paypal.com.account-verification-notice.xyz/login.html',
    domain: 'paypal.com.account-verification-notice.xyz',
    prediction: 'Phishing',
    riskLevel: 'CRITICAL',
    riskScore: 96,
    mlConfidence: 99.2,
    timestamp: '2 mins ago',
    indicators: ['Subdomain Stacking', 'High-Abuse TLD (.xyz)', 'Unencrypted HTTP', 'Brand Keyword: paypal'],
    status: 'Blocked',
  },
  {
    id: 'scn-9020',
    url: 'https://github.com/torvalds/linux/blob/master/Makefile',
    domain: 'github.com',
    prediction: 'Legitimate',
    riskLevel: 'LOW',
    riskScore: 6,
    mlConfidence: 98.8,
    timestamp: '8 mins ago',
    indicators: ['Valid High-Trust TLS Certificate', 'Strict HSTS & CSP', 'Established Clean Domain'],
    status: 'Verified Safe',
  },
  {
    id: 'scn-9019',
    url: 'http://185.220.101.4:8080/apple/id/verify.php',
    domain: '185.220.101.4',
    prediction: 'Phishing',
    riskLevel: 'CRITICAL',
    riskScore: 98,
    mlConfidence: 99.6,
    timestamp: '14 mins ago',
    indicators: ['Raw IP Hostname', 'Non-Standard Web Port (8080)', 'Known Phishing Kit Lure'],
    status: 'Blocked',
  },
  {
    id: 'scn-9018',
    url: 'https://cloud-storage-temporary-share-98.top/download',
    domain: 'cloud-storage-temporary-share-98.top',
    prediction: 'Suspicious',
    riskLevel: 'SUSPICIOUS',
    riskScore: 54,
    mlConfidence: 78.4,
    timestamp: '22 mins ago',
    indicators: ['High Domain Entropy', 'Missing HSTS Preload', 'Recently Registered Domain'],
    status: 'Flagged',
  },
  {
    id: 'scn-9017',
    url: 'https://www.chase.com/personal/banking',
    domain: 'chase.com',
    prediction: 'Legitimate',
    riskLevel: 'LOW',
    riskScore: 4,
    mlConfidence: 99.4,
    timestamp: '35 mins ago',
    indicators: ['DigiCert EV TLS Certificate', 'Multi-layer CSP & DNSSEC', 'Zero Phish Flags'],
    status: 'Verified Safe',
  },
  {
    id: 'scn-9016',
    url: 'http://steamcommunity.com.gift-inventory-claim.rest/trade',
    domain: 'steamcommunity.com.gift-inventory-claim.rest',
    prediction: 'Phishing',
    riskLevel: 'HIGH',
    riskScore: 78,
    mlConfidence: 92.1,
    timestamp: '49 mins ago',
    indicators: ['Third-level Subdomain Spoofing', 'Gaming Lure Keyword', 'No TLS Encryption'],
    status: 'Blocked',
  },
  {
    id: 'scn-9015',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP',
    domain: 'developer.mozilla.org',
    prediction: 'Legitimate',
    riskLevel: 'LOW',
    riskScore: 5,
    mlConfidence: 99.0,
    timestamp: '1 hour ago',
    indicators: ['A+ Security Header Rating', 'Established Educational Tech Host'],
    status: 'Verified Safe',
  },
]

