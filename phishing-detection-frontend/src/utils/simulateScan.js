// ---------------------------------------------------------------------------
// simulateScan.js – Deterministic phishing-detection simulation utility
// ---------------------------------------------------------------------------
// This module powers the frontend demo scanner. Every result is generated
// client-side from URL heuristics — no backend calls are made.
// ---------------------------------------------------------------------------

// ── Constants ───────────────────────────────────────────────────────────────

export const EXAMPLE_URLS = [
  { url: 'http://paypal.com.account-verification-notice.xyz/login.html', label: 'PayPal Phish Lure', category: 'phishing' },
  { url: 'http://185.220.101.4:8080/apple/id/verify.php', label: 'IP-Based Phishing', category: 'phishing' },
  { url: 'https://github.com/torvalds/linux', label: 'GitHub (Legitimate)', category: 'legitimate' },
  { url: 'https://www.google.com', label: 'Google (Legitimate)', category: 'legitimate' },
  { url: 'https://cloud-storage-temporary-share-98.top/download', label: 'Suspicious Domain', category: 'suspicious' },
  { url: 'http://steamcommunity.com.gift-inventory-claim.rest/trade', label: 'Steam Impersonation', category: 'phishing' },
];

export const URL_SHORTENERS = new Set([
  'bit.ly',
  't.co',
  'tinyurl.com',
  'goo.gl',
  'ow.ly',
  'is.gd',
  'buff.ly',
]);

// ── Internal lookup tables ──────────────────────────────────────────────────

const BRAND_KEYWORDS = [
  'paypal', 'apple', 'microsoft', 'chase', 'amazon',
  'steam', 'netflix', 'google', 'facebook', 'bank',
  'wells', 'citi',
];

const HIGH_ABUSE_TLDS = new Set([
  '.xyz', '.top', '.tk', '.ml', '.ga', '.cf',
  '.gq', '.rest', '.buzz', '.work', '.click', '.link',
]);

const SUSPICIOUS_PATH_KEYWORDS = [
  'login', 'verify', 'confirm', 'secure', 'update',
  'account', 'signin', 'auth', 'token', 'password', 'credential',
];

const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}$/;

const SUSPICIOUS_ENCODING_PATTERNS = [
  '%00', '%0d', '%0a', '%0D', '%0A',
  '%25', '%3c', '%3e', '%22', '%27',
  '%3C', '%3E',
];

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Deterministic hash of a string → number in [0, 1).
 * Used to add reproducible "variance" to scores.
 */
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash % 10000) / 10000; // 0 … 0.9999
}

/**
 * Calculate the Shannon entropy of a string.
 * @param {string} str
 * @returns {number}
 */
export function calculateEntropy(str) {
  if (!str || str.length === 0) return 0;

  const freq = {};
  for (const ch of str) {
    freq[ch] = (freq[ch] || 0) + 1;
  }

  const len = str.length;
  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / len;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  return Math.round(entropy * 1000) / 1000;
}

// ── URL Validation ──────────────────────────────────────────────────────────

/**
 * Validate that `urlString` is a well-formed http(s) URL.
 * @param {string} urlString
 * @returns {{ valid: boolean, error: string|null }}
 */
export function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { valid: false, error: 'Only http and https schemes are accepted.' };
    }
    return { valid: true, error: null };
  } catch {
    return { valid: false, error: 'Invalid URL format.' };
  }
}

// ── Main Simulation ─────────────────────────────────────────────────────────

/**
 * Analyse a URL entirely client-side and return a deterministic simulated
 * phishing-detection result object.
 *
 * @param {string} urlString
 * @returns {object} Simulated scan result
 */
export function simulateScan(urlString) {
  const parsed = new URL(urlString);

  // ── Extract basic parts ─────────────────────────────────────────────────
  const domain = parsed.hostname;
  const path = parsed.pathname;
  const queryParams = parsed.searchParams;
  const queryParamCount = Array.from(queryParams.keys()).length;
  const protocol = parsed.protocol; // 'http:' | 'https:'
  const isHTTPS = protocol === 'https:';
  const port = parsed.port;

  // Subdomain breakdown
  const domainParts = domain.split('.');
  const subdomainCount = Math.max(0, domainParts.length - 2);
  const tld = '.' + domainParts[domainParts.length - 1];

  // ── URL characteristic flags ────────────────────────────────────────────
  const hasIPAddress = IPV4_RE.test(domain);
  const hasAtSymbol = urlString.includes('@');
  const hasPunycode = domain.includes('xn--');
  const suspiciousTLD = HIGH_ABUSE_TLDS.has(tld.toLowerCase());
  const suspiciousPort = port !== '' && port !== '80' && port !== '443';
  const isURLShortener = URL_SHORTENERS.has(domain.toLowerCase());
  const hasSuspiciousEncoding = SUSPICIOUS_ENCODING_PATTERNS.some((p) =>
    urlString.toLowerCase().includes(p.toLowerCase()),
  );

  // Counts
  const dotCount = (urlString.match(/\./g) || []).length;
  const hyphenCount = (domain.match(/-/g) || []).length;
  const specialCharCount = (urlString.match(/[@!#$%^&*()+=[\]{}|\\<>~`]/g) || []).length;
  const domainEntropy = calculateEntropy(domain);

  // Keyword analysis
  const lowerUrl = urlString.toLowerCase();
  const lowerPath = path.toLowerCase();
  const lowerDomain = domain.toLowerCase();

  const suspiciousKeywords = SUSPICIOUS_PATH_KEYWORDS.filter(
    (kw) => lowerPath.includes(kw) || lowerUrl.includes(kw) || lowerDomain.includes(kw),
  );

  const brandInSubdomain = BRAND_KEYWORDS.some((brand) => {
    // Check subdomains only (everything except the registered domain + TLD)
    const subdomainStr = domainParts.slice(0, -2).join('.').toLowerCase();
    return subdomainStr.includes(brand);
  });

  // ── Risk score accumulation ─────────────────────────────────────────────
  const indicators = [];
  let rawScore = 0;

  if (brandInSubdomain) {
    rawScore += 25;
    indicators.push({
      title: 'Brand Impersonation in Subdomain',
      severity: 'CRITICAL',
      description: 'A well-known brand name was detected in the subdomain — a common phishing technique to deceive users.',
    });
  }

  if (hasIPAddress) {
    rawScore += 22;
    indicators.push({
      title: 'IP Address Used as Host',
      severity: 'HIGH',
      description: 'The URL uses a raw IP address instead of a domain name, which is unusual for legitimate services.',
    });
  }

  if (suspiciousTLD) {
    rawScore += 18;
    indicators.push({
      title: 'High-Abuse TLD',
      severity: 'HIGH',
      description: `The TLD "${tld}" is frequently associated with malicious registrations.`,
    });
  }

  if (subdomainCount >= 3) {
    rawScore += 15;
    indicators.push({
      title: 'Excessive Subdomains',
      severity: 'MEDIUM',
      description: `The domain contains ${subdomainCount} subdomains, which is often used to obscure the true destination.`,
    });
  }

  if (suspiciousKeywords.length > 0) {
    rawScore += Math.min(suspiciousKeywords.length * 8, 20);
    indicators.push({
      title: 'Suspicious Path Keywords',
      severity: 'MEDIUM',
      description: `Keywords found: ${suspiciousKeywords.join(', ')}. These are commonly used in credential-harvesting pages.`,
    });
  }

  if (suspiciousPort) {
    rawScore += 12;
    indicators.push({
      title: 'Non-Standard Port',
      severity: 'MEDIUM',
      description: `Port ${port} is not a standard web port (80/443). Attackers often use alternate ports to avoid detection.`,
    });
  }

  if (hasAtSymbol) {
    rawScore += 15;
    indicators.push({
      title: '@ Symbol in URL',
      severity: 'HIGH',
      description: 'The @ symbol can be used to disguise the actual destination by placing a deceptive host before it.',
    });
  }

  if (hasPunycode) {
    rawScore += 20;
    indicators.push({
      title: 'Punycode / IDN Homograph',
      severity: 'HIGH',
      description: 'Internationalised domain encoding detected. This technique can make malicious domains look identical to legitimate ones.',
    });
  }

  if (urlString.length > 75) {
    rawScore += 8;
    indicators.push({
      title: 'Excessively Long URL',
      severity: 'LOW',
      description: `URL length is ${urlString.length} characters. Unusually long URLs can be used to hide suspicious components.`,
    });
  }

  if (hasSuspiciousEncoding) {
    rawScore += 14;
    indicators.push({
      title: 'Suspicious URL Encoding',
      severity: 'HIGH',
      description: 'Potentially malicious percent-encoded characters detected (e.g. null bytes, CRLF injection sequences).',
    });
  }

  if (!isHTTPS) {
    rawScore += 10;
    indicators.push({
      title: 'No HTTPS',
      severity: 'MEDIUM',
      description: 'The URL does not use HTTPS. Data sent to this page could be intercepted.',
    });
  }

  if (isURLShortener) {
    rawScore += 10;
    indicators.push({
      title: 'URL Shortener Detected',
      severity: 'LOW',
      description: 'Shortened URLs obscure the final destination and are often used in phishing campaigns.',
    });
  }

  // Add deterministic variance (±5) based on URL hash
  const variance = Math.floor(hashString(urlString) * 11) - 5;
  rawScore = Math.max(0, Math.min(100, rawScore + variance));

  // ── Derived verdicts ────────────────────────────────────────────────────
  const riskScore = rawScore;

  let riskLevel;
  if (riskScore >= 80) riskLevel = 'CRITICAL';
  else if (riskScore >= 60) riskLevel = 'HIGH';
  else if (riskScore >= 30) riskLevel = 'SUSPICIOUS';
  else riskLevel = 'LOW';

  let prediction;
  if (riskScore >= 60) prediction = 'Phishing';
  else if (riskScore >= 30) prediction = 'Suspicious';
  else prediction = 'Legitimate';

  // Confidence: higher when the score is more extreme (close to 0 or 100)
  const distFromCenter = Math.abs(riskScore - 50) / 50; // 0‒1
  const confidence = Math.round((0.75 + distFromCenter * 0.24) * 100) / 100;

  // ── URL Characteristics ─────────────────────────────────────────────────
  const urlCharacteristics = {
    urlLength: urlString.length,
    domainLength: domain.length,
    dotCount,
    hyphenCount,
    specialCharCount,
    subdomainCount,
    hasIPAddress,
    hasAtSymbol,
    hasSuspiciousEncoding,
    suspiciousKeywords,
    isHTTPS,
    pathLength: path.length,
    queryParamCount,
    suspiciousTLD,
    domainEntropy,
    hasPunycode,
    suspiciousPort,
    isURLShortener,
  };

  // ── Simulated SSL / TLS status ──────────────────────────────────────────
  const h = hashString(domain);
  const sslGrades = ['A+', 'A', 'B', 'C', 'F'];

  let sslStatus;
  if (isHTTPS) {
    const gradeIndex = riskScore >= 60 ? 3 + Math.round(h) : Math.min(Math.floor(h * 3), 2);
    const now = new Date();
    const validFrom = new Date(now);
    validFrom.setMonth(validFrom.getMonth() - Math.floor(h * 12 + 1));
    const validTo = new Date(validFrom);
    validTo.setFullYear(validTo.getFullYear() + 1);

    sslStatus = {
      hasSSL: true,
      protocol: 'TLS 1.3',
      issuer: riskScore >= 60 ? "Let's Encrypt" : 'DigiCert Inc',
      validFrom: validFrom.toISOString().split('T')[0],
      validTo: validTo.toISOString().split('T')[0],
      keySize: riskScore >= 60 ? 2048 : 4096,
      signatureAlgorithm: 'SHA-256 with RSA',
      sanMatch: riskScore < 60,
      ctLogged: riskScore < 40,
      grade: sslGrades[gradeIndex],
    };
  } else {
    sslStatus = {
      hasSSL: false,
      protocol: 'None',
      issuer: 'N/A',
      validFrom: 'N/A',
      validTo: 'N/A',
      keySize: 0,
      signatureAlgorithm: 'N/A',
      sanMatch: false,
      ctLogged: false,
      grade: 'F',
    };
  }

  // ── Simulated HTTP security headers ─────────────────────────────────────
  const isLegitimate = riskScore < 30;
  const isSuspicious = riskScore >= 30 && riskScore < 60;

  const httpHeaders = [
    {
      name: 'Content-Security-Policy',
      present: isLegitimate,
      value: isLegitimate ? "default-src 'self'; script-src 'self'" : 'Not set',
      severity: isLegitimate ? 'PASS' : 'FAIL',
    },
    {
      name: 'X-Content-Type-Options',
      present: isLegitimate || isSuspicious,
      value: isLegitimate || isSuspicious ? 'nosniff' : 'Not set',
      severity: isLegitimate || isSuspicious ? 'PASS' : 'FAIL',
    },
    {
      name: 'X-Frame-Options',
      present: isLegitimate,
      value: isLegitimate ? 'DENY' : 'Not set',
      severity: isLegitimate ? 'PASS' : 'WARN',
    },
    {
      name: 'Strict-Transport-Security',
      present: isLegitimate && isHTTPS,
      value: isLegitimate && isHTTPS ? 'max-age=31536000; includeSubDomains' : 'Not set',
      severity: isLegitimate && isHTTPS ? 'PASS' : isHTTPS ? 'WARN' : 'FAIL',
    },
    {
      name: 'Referrer-Policy',
      present: isLegitimate,
      value: isLegitimate ? 'strict-origin-when-cross-origin' : 'Not set',
      severity: isLegitimate ? 'PASS' : 'WARN',
    },
    {
      name: 'Permissions-Policy',
      present: isLegitimate,
      value: isLegitimate ? 'geolocation=(), camera=()' : 'Not set',
      severity: isLegitimate ? 'PASS' : 'WARN',
    },
    {
      name: 'X-XSS-Protection',
      present: isLegitimate || isSuspicious,
      value: isLegitimate || isSuspicious ? '1; mode=block' : 'Not set',
      severity: isLegitimate || isSuspicious ? 'PASS' : 'FAIL',
    },
  ];

  // ── Recommendations ─────────────────────────────────────────────────────
  const recommendations = [];

  if (!isHTTPS) {
    recommendations.push({
      priority: 'HIGH',
      title: 'Avoid entering data on non-HTTPS pages',
      description: 'This URL does not use encryption. Never submit passwords or personal information on plain HTTP pages.',
    });
  }

  if (prediction === 'Phishing') {
    recommendations.push({
      priority: 'HIGH',
      title: 'Do not interact with this page',
      description: 'Multiple indicators suggest this is a phishing page. Close the tab and report it to the impersonated organisation.',
    });
    recommendations.push({
      priority: 'HIGH',
      title: 'Check the official website directly',
      description: 'If you expected a legitimate service, navigate to the official website by typing the URL manually or using a bookmark.',
    });
  }

  if (prediction === 'Suspicious') {
    recommendations.push({
      priority: 'MEDIUM',
      title: 'Proceed with caution',
      description: 'Some characteristics of this URL are unusual. Verify the source before entering any sensitive information.',
    });
  }

  if (suspiciousKeywords.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      title: 'Beware of credential-harvesting pages',
      description: 'The URL path contains keywords commonly found on fake login or verification pages.',
    });
  }

  if (isURLShortener) {
    recommendations.push({
      priority: 'LOW',
      title: 'Expand shortened URLs before clicking',
      description: 'Use a URL-expansion service to reveal the true destination before visiting shortened links.',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'LOW',
      title: 'URL appears safe',
      description: 'No significant risk indicators were found. Standard security practices still apply.',
    });
  }

  // ── Component scores (for radar / breakdown charts) ─────────────────────
  const h2 = hashString(urlString + ':components');
  const baseML = riskScore >= 60 ? 70 + Math.floor(h2 * 25) : riskScore >= 30 ? 35 + Math.floor(h2 * 30) : 5 + Math.floor(h2 * 20);
  const baseLexical = Math.min(100, Math.round(riskScore * 1.1 + (h2 * 10 - 5)));
  const baseWebSec = isLegitimate ? Math.floor(5 + h2 * 15) : isSuspicious ? Math.floor(30 + h2 * 25) : Math.floor(55 + h2 * 35);
  const baseTLS = !isHTTPS ? 80 + Math.floor(h2 * 20) : isLegitimate ? Math.floor(h2 * 15) : Math.floor(30 + h2 * 30);
  const baseThreat = riskScore >= 60 ? 60 + Math.floor(h2 * 30) : riskScore >= 30 ? 20 + Math.floor(h2 * 30) : Math.floor(h2 * 15);

  const clamp = (v) => Math.max(0, Math.min(100, v));

  const componentScores = {
    mlAnalysis: clamp(baseML),
    domainLexical: clamp(baseLexical),
    webSecurity: clamp(baseWebSec),
    tlsCertificate: clamp(baseTLS),
    threatIntel: clamp(baseThreat),
  };

  // ── If no indicators were raised, add an informational one ──────────────
  if (indicators.length === 0) {
    indicators.push({
      title: 'No Suspicious Indicators',
      severity: 'INFO',
      description: 'The URL did not trigger any heuristic rules. It appears to be benign based on structural analysis.',
    });
  }

  // ── Assemble result ─────────────────────────────────────────────────────
  return {
    url: urlString,
    domain,
    timestamp: new Date().toISOString(),
    simulatedDemo: true,

    // Core verdict
    prediction,
    riskScore,
    riskLevel,
    confidence,

    // URL characteristics
    urlCharacteristics,

    // SSL / TLS
    sslStatus,

    // HTTP headers
    httpHeaders,

    // Indicators & recommendations
    suspiciousIndicators: indicators,
    recommendations,

    // Component breakdown
    componentScores,
  };
}

// ── Report Text Generator ───────────────────────────────────────────────────

/**
 * Produce a plain-text report suitable for download as a `.txt` file.
 *
 * @param {object} result – The object returned by `simulateScan`
 * @returns {string}
 */
export function generateReportText(result) {
  const divider = '='.repeat(72);
  const thinDivider = '-'.repeat(72);
  const lines = [];

  const push = (text = '') => lines.push(text);

  push(divider);
  push('  SIMULATED DEMONSTRATION REPORT');
  push(divider);
  push();
  push('  ⚠  DISCLAIMER');
  push('  This report was generated by a frontend demonstration and does NOT');
  push('  represent actual security analysis. Results are heuristic-based');
  push('  simulations for educational and demo purposes only.');
  push();
  push(thinDivider);
  push('  SCAN DETAILS');
  push(thinDivider);
  push(`  URL:         ${result.url}`);
  push(`  Domain:      ${result.domain}`);
  push(`  Timestamp:   ${result.timestamp}`);
  push();

  push(thinDivider);
  push('  VERDICT');
  push(thinDivider);
  push(`  Prediction:  ${result.prediction}`);
  push(`  Risk Score:  ${result.riskScore} / 100`);
  push(`  Risk Level:  ${result.riskLevel}`);
  push(`  Confidence:  ${(result.confidence * 100).toFixed(0)}%`);
  push();

  // Component scores
  push(thinDivider);
  push('  COMPONENT SCORES');
  push(thinDivider);
  const cs = result.componentScores;
  push(`  ML Analysis:      ${cs.mlAnalysis}/100`);
  push(`  Domain / Lexical:  ${cs.domainLexical}/100`);
  push(`  Web Security:      ${cs.webSecurity}/100`);
  push(`  TLS Certificate:   ${cs.tlsCertificate}/100`);
  push(`  Threat Intel:      ${cs.threatIntel}/100`);
  push();

  // URL Characteristics
  push(thinDivider);
  push('  URL CHARACTERISTICS');
  push(thinDivider);
  const uc = result.urlCharacteristics;
  push(`  URL Length:            ${uc.urlLength}`);
  push(`  Domain Length:         ${uc.domainLength}`);
  push(`  Dot Count:             ${uc.dotCount}`);
  push(`  Hyphen Count:          ${uc.hyphenCount}`);
  push(`  Special Char Count:    ${uc.specialCharCount}`);
  push(`  Subdomain Count:       ${uc.subdomainCount}`);
  push(`  Has IP Address:        ${uc.hasIPAddress}`);
  push(`  Has @ Symbol:          ${uc.hasAtSymbol}`);
  push(`  Suspicious Encoding:   ${uc.hasSuspiciousEncoding}`);
  push(`  Suspicious Keywords:   ${uc.suspiciousKeywords.length > 0 ? uc.suspiciousKeywords.join(', ') : 'None'}`);
  push(`  HTTPS:                 ${uc.isHTTPS}`);
  push(`  Path Length:           ${uc.pathLength}`);
  push(`  Query Params:          ${uc.queryParamCount}`);
  push(`  Suspicious TLD:        ${uc.suspiciousTLD}`);
  push(`  Domain Entropy:        ${uc.domainEntropy}`);
  push(`  Punycode:              ${uc.hasPunycode}`);
  push(`  Non-Standard Port:     ${uc.suspiciousPort}`);
  push(`  URL Shortener:         ${uc.isURLShortener}`);
  push();

  // SSL Status
  push(thinDivider);
  push('  SSL / TLS STATUS');
  push(thinDivider);
  const ssl = result.sslStatus;
  push(`  Has SSL:               ${ssl.hasSSL}`);
  push(`  Protocol:              ${ssl.protocol}`);
  push(`  Issuer:                ${ssl.issuer}`);
  push(`  Valid From:            ${ssl.validFrom}`);
  push(`  Valid To:              ${ssl.validTo}`);
  push(`  Key Size:              ${ssl.keySize}`);
  push(`  Signature Algorithm:   ${ssl.signatureAlgorithm}`);
  push(`  SAN Match:             ${ssl.sanMatch}`);
  push(`  CT Logged:             ${ssl.ctLogged}`);
  push(`  Grade:                 ${ssl.grade}`);
  push();

  // HTTP Headers
  push(thinDivider);
  push('  HTTP SECURITY HEADERS');
  push(thinDivider);
  result.httpHeaders.forEach((hdr) => {
    const status = hdr.present ? '✓' : '✗';
    push(`  [${hdr.severity.padEnd(4)}] ${status}  ${hdr.name}: ${hdr.value}`);
  });
  push();

  // Suspicious Indicators
  push(thinDivider);
  push('  SUSPICIOUS INDICATORS');
  push(thinDivider);
  if (result.suspiciousIndicators.length === 0) {
    push('  None detected.');
  } else {
    result.suspiciousIndicators.forEach((ind, i) => {
      push(`  ${i + 1}. [${ind.severity}] ${ind.title}`);
      push(`     ${ind.description}`);
    });
  }
  push();

  // Recommendations
  push(thinDivider);
  push('  RECOMMENDATIONS');
  push(thinDivider);
  result.recommendations.forEach((rec, i) => {
    push(`  ${i + 1}. [${rec.priority}] ${rec.title}`);
    push(`     ${rec.description}`);
  });
  push();

  push(divider);
  push(`  Generated: ${result.timestamp}`);
  push('  Mode: Simulated Demo — Not a real security assessment');
  push(divider);

  return lines.join('\n');
}
