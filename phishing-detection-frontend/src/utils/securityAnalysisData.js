/**
 * securityAnalysisData.js - Deep Security Profile Generator
 * Generates comprehensive simulated SSL/TLS, HTTP Headers, DNS and Finding telemetry.
 */

export function getSecurityAnalysis(targetInput) {
  const cleanInput = (targetInput || 'github.com').trim()
  const domain = cleanInput.replace(/^https?:\/\//, '').split('/')[0].split(':')[0]
  const isHttps = cleanInput.startsWith('https://') || !cleanInput.startsWith('http://')

  const lowerDomain = domain.toLowerCase()
  const isPhish =
    lowerDomain.includes('paypal') ||
    lowerDomain.includes('.xyz') ||
    lowerDomain.includes('.rest') ||
    lowerDomain.includes('steam') ||
    lowerDomain.includes('185.220') ||
    lowerDomain.includes('account-verification') ||
    lowerDomain.includes('claim')

  const isSuspicious =
    lowerDomain.includes('.top') ||
    lowerDomain.includes('temporary-share') ||
    lowerDomain.includes('token')

  // 1. SSL/TLS Certificate Telemetry
  let certificate
  if (isPhish && !isHttps) {
    certificate = {
      hasSSL: false,
      status: 'No SSL Configured',
      issuer: 'None (Plaintext HTTP Transport)',
      subject: `CN=${domain}`,
      validFrom: 'N/A',
      expiryDate: 'N/A',
      daysRemaining: 0,
      validityBadge: { label: 'Insecure / Cleartext', color: 'rose', status: 'FAIL' },
      keySize: 'None',
      cipherSuite: 'None (Insecure cleartext transmission)',
      protocol: 'HTTP/1.1 (Unencrypted)',
      sanList: [],
      grade: 'F',
      ctLogged: false,
      sanMatch: false,
    }
  } else if (isPhish && isHttps) {
    certificate = {
      hasSSL: true,
      status: 'Host Mismatch / Untrusted CA',
      issuer: "Let's Encrypt Authority X3 (Free Automated Issuance)",
      subject: `CN=*.free-hosting-portal.internal, OU=Automated Domain Validation`,
      validFrom: '2024-10-01',
      expiryDate: '2025-01-01',
      daysRemaining: -45,
      validityBadge: { label: 'Expired & Mismatched', color: 'rose', status: 'FAIL' },
      keySize: 'RSA 1024-bit (Deprecate: Weak)',
      cipherSuite: 'TLS_RSA_WITH_AES_128_CBC_SHA (Insecure CBC)',
      protocol: 'TLSv1.1 (Deprecated)',
      sanList: ['*.free-hosting-portal.internal'],
      grade: 'F',
      ctLogged: false,
      sanMatch: false,
    }
  } else if (isSuspicious) {
    certificate = {
      hasSSL: true,
      status: 'Valid (Domain Validated Only)',
      issuer: 'cPanel, Inc. Certification Authority',
      subject: `CN=${domain}`,
      validFrom: '2024-08-15',
      expiryDate: '2025-08-15',
      daysRemaining: 34,
      validityBadge: { label: 'Expiring Soon', color: 'amber', status: 'WARN' },
      keySize: 'RSA 2048-bit',
      cipherSuite: 'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
      protocol: 'TLSv1.2',
      sanList: [domain, `www.${domain}`],
      grade: 'B',
      ctLogged: true,
      sanMatch: true,
    }
  } else {
    // Clean / High Assurance
    certificate = {
      hasSSL: true,
      status: 'Valid & Active (Strict SAN Verified)',
      issuer: 'DigiCert Global G2 TLS RSA SHA256 2020 CA1',
      subject: `CN=${domain}, O=${domain.split('.')[0].toUpperCase()} Inc., L=San Francisco, ST=California, C=US`,
      validFrom: '2024-03-12',
      expiryDate: '2026-03-15',
      daysRemaining: 492,
      validityBadge: { label: 'High Assurance EV/OV', color: 'emerald', status: 'PASS' },
      keySize: 'RSA 4096-bit',
      cipherSuite: 'TLS_AES_256_GCM_SHA384 (Modern TLSv1.3)',
      protocol: 'TLSv1.3 (RFC 8446)',
      sanList: [domain, `www.${domain}`, `*.${domain}`],
      grade: 'A+',
      ctLogged: true,
      sanMatch: true,
    }
  }

  // 2. HTTP Security Headers
  const httpHeaders = [
    {
      name: 'Content-Security-Policy (CSP)',
      key: 'Content-Security-Policy',
      status: isPhish ? 'FAIL' : isSuspicious ? 'WARN' : 'PASS',
      value: isPhish
        ? 'Missing'
        : isSuspicious
        ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' *"
        : "default-src 'none'; script-src 'self' 'nonce-...' https:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none'",
      explanation:
        'Restricts resource loading (scripts, stylesheets, frames) to prevent Cross-Site Scripting (XSS), clickjacking, and illicit credential exfiltration.',
      recommendation: isPhish
        ? 'Deploy a strict CSP header without unsafe-inline or wildcard domains to restrict unauthorized script execution.'
        : isSuspicious
        ? "Refactor CSP to remove 'unsafe-eval' and wildcard source domains to prevent arbitrary code execution."
        : 'CSP adheres to baseline security posture. Consider implementing report-uri for violation telemetry.',
    },
    {
      name: 'Strict-Transport-Security (HSTS)',
      key: 'Strict-Transport-Security',
      status: isPhish ? 'FAIL' : isSuspicious ? 'WARN' : 'PASS',
      value: isPhish
        ? 'Missing (Cleartext HTTP allowed)'
        : isSuspicious
        ? 'max-age=86400 (Only 1 day cache)'
        : 'max-age=31536000; includeSubDomains; preload',
      explanation:
        'Enforces secure browser connections over HTTPS exclusively, mitigating man-in-the-middle SSL stripping and cookie hijacking attacks.',
      recommendation: isPhish
        ? 'Implement HSTS with a max-age of at least 31536000 seconds (1 year) and include the includeSubDomains directive.'
        : isSuspicious
        ? 'Increase max-age to 31536000 and submit the domain to the Chromium HSTS Preload list.'
        : 'Optimal HSTS deployment. Domain is protected against protocol downgrade attacks.',
    },
    {
      name: 'X-Frame-Options',
      key: 'X-Frame-Options',
      status: isPhish ? 'FAIL' : 'PASS',
      value: isPhish ? 'Missing (Vulnerable to Clickjacking)' : 'DENY',
      explanation:
        'Controls whether a web browser is permitted to render a web page within an <frame>, <iframe>, <embed> or <object> element to protect against clickjacking.',
      recommendation: isPhish
        ? "Add 'X-Frame-Options: DENY' or use CSP frame-ancestors 'none' to block framing by malicious third-party origins."
        : 'Configured properly. Page framing is strictly prohibited.',
    },
    {
      name: 'X-Content-Type-Options',
      key: 'X-Content-Type-Options',
      status: isPhish ? 'FAIL' : 'PASS',
      value: isPhish ? 'Missing' : 'nosniff',
      explanation:
        'Forces the user agent to strictly honor the declared Content-Type, mitigating MIME-confusion attacks and executable file misinterpretations.',
      recommendation: isPhish
        ? "Set 'X-Content-Type-Options: nosniff' on all static and dynamic responses to block MIME confusion."
        : 'Configured properly to enforce strict content type handling.',
    },
    {
      name: 'Referrer-Policy',
      key: 'Referrer-Policy',
      status: isPhish ? 'WARN' : 'PASS',
      value: isPhish ? 'unsafe-url' : 'strict-origin-when-cross-origin',
      explanation:
        'Controls what referrer metadata is transmitted when a user follows a hyperlink or loads an external asset.',
      recommendation: isPhish
        ? 'Replace unsafe-url with strict-origin-when-cross-origin to avoid leaking sensitive query tokens or path arguments.'
        : 'Header is operating securely. Cross-origin path and query tokens are shielded.',
    },
  ]

  // 3. DNS Information
  let dns
  if (isPhish) {
    dns = {
      aRecords: ['185.220.101.4', '185.220.101.7'],
      aaaaRecords: ['Not Configured'],
      mxRecords: ['10 mail.bulletproof-host.xyz (Untrusted Registrar)'],
      nsRecords: ['ns1.anonymous-dns-service.com', 'ns2.anonymous-dns-service.com'],
      dnsSecurityStatus: {
        dnssec: 'Unsigned / No RRSIG Records',
        dnssecStatus: 'FAIL',
        caaRecord: 'None Configured (Any CA can issue certificates)',
        caaStatus: 'FAIL',
        authoritativeValidation: 'Suspicious Offshore Fast-Flux Provider',
        ttl: '60s (Fast-Flux Phishing Behavior)',
      },
    }
  } else if (isSuspicious) {
    dns = {
      aRecords: ['104.21.48.19', '172.67.182.90'],
      aaaaRecords: ['2606:4700:3033::6815:3013'],
      mxRecords: ['0 mail.temporary-share-98.top'],
      nsRecords: ['eva.ns.cloudflare.com', 'jermaine.ns.cloudflare.com'],
      dnsSecurityStatus: {
        dnssec: 'DNSSEC Inactive',
        dnssecStatus: 'WARN',
        caaRecord: 'Active: issue "comodoca.com"',
        caaStatus: 'PASS',
        authoritativeValidation: 'Cloudflare Shared Anycast Network',
        ttl: '300s',
      },
    }
  } else {
    dns = {
      aRecords: ['140.82.121.4', '140.82.121.3'],
      aaaaRecords: ['2606:50c0:8000::154', '2606:50c0:8001::154'],
      mxRecords: ['10 aspmx.l.google.com', '20 alt1.aspmx.l.google.com', '30 alt2.aspmx.l.google.com'],
      nsRecords: ['dns1.p08.nsone.net', 'dns2.p08.nsone.net', 'ns-1283.awsdns-32.org', 'ns-424.awsdns-53.com'],
      dnsSecurityStatus: {
        dnssec: 'Signed & Validated (NSEC3 with SHA-256)',
        dnssecStatus: 'PASS',
        caaRecord: 'issue "digicert.com"; issue "letsencrypt.org"',
        caaStatus: 'PASS',
        authoritativeValidation: 'Enterprise Dual Anycast Infrastructure',
        ttl: '3600s (Standard caching profile)',
      },
    }
  }

  // 4. Security Findings
  let findings
  if (isPhish) {
    findings = [
      {
        severity: 'CRITICAL',
        title: 'Missing Transport Encryption (Cleartext HTTP Operation)',
        description:
          'Target web server transmits credentials, session tokens, and passwords in cleartext without TLS protection.',
        recommendedAction: 'Mandate modern TLSv1.3 with an authentic CA certificate and configure an immediate HTTP-to-HTTPS redirect.',
      },
      {
        severity: 'CRITICAL',
        title: 'Host Mismatch & Untrusted Certificate Authority',
        description:
          'Presented certificate does not contain the subject domain name in its Subject Alternative Name (SAN) list.',
        recommendedAction: 'Cease end-user interaction. Block domain egress on firewall and enterprise proxy appliances.',
      },
      {
        severity: 'HIGH',
        title: 'Missing Clickjacking Defense (X-Frame-Options & CSP)',
        description:
          'No X-Frame-Options or CSP frame-ancestors directive is present, allowing this page to be seamlessly embedded inside an attacker-controlled iframe overlay.',
        recommendedAction: "Add 'X-Frame-Options: DENY' or 'frame-ancestors: none' in the server HTTP response header configuration.",
      },
      {
        severity: 'HIGH',
        title: 'Fast-Flux DNS Anomaly Detected',
        description:
          'DNS records exhibit an abnormally short TTL (60 seconds) combined with known bulletproof registrar nameservers.',
        recommendedAction: 'Add the resolving IP addresses to company egress blocklists and report domain to the registrar abuse contact.',
      },
      {
        severity: 'MEDIUM',
        title: 'Missing Defensive MIME Header (X-Content-Type-Options)',
        description:
          'Absence of nosniff header allows user browsers to perform speculative content sniffing on user uploads.',
        recommendedAction: "Configure web server to return 'X-Content-Type-Options: nosniff'.",
      },
    ]
  } else if (isSuspicious) {
    findings = [
      {
        severity: 'HIGH',
        title: 'Overly Permissive Content Security Policy (CSP)',
        description:
          "The CSP includes 'unsafe-inline' and wildcard origins (*), which severely degrades defenses against script injection.",
        recommendedAction: 'Restrict script-src to cryptographic nonces or hashes and declare exact trusted CDN hostnames.',
      },
      {
        severity: 'MEDIUM',
        title: 'HSTS Max-Age Configuration Below Recommended Standard',
        description:
          'HSTS duration is set to only 86400 seconds (1 day), leaving returning visitors vulnerable to SSL stripping after brief inactivity.',
        recommendedAction: 'Increase HSTS max-age to 31536000 seconds (1 year) and include the includeSubDomains directive.',
      },
      {
        severity: 'LOW',
        title: 'DNSSEC Validation Inactive',
        description:
          'Domain records are not cryptographically signed with DNSSEC, allowing potential local cache poisoning on vulnerable resolvers.',
        recommendedAction: 'Enable DNSSEC signing via registrar management console to protect zone records.',
      },
      {
        severity: 'INFORMATIONAL',
        title: 'Short Certificate Validity Horizon',
        description:
          'The existing TLS certificate will expire in less than 45 days. Automated certificate renewal should be monitored.',
        recommendedAction: 'Verify ACME automated renewal cron jobs are operational.',
      },
    ]
  } else {
    findings = [
      {
        severity: 'INFORMATIONAL',
        title: 'Compliant Modern Cryptographic Baseline',
        description:
          'TLS socket negotiated TLSv1.3 with 4096-bit RSA key and TLS_AES_256_GCM_SHA384 cipher suite. Zero legacy protocols active.',
        recommendedAction: 'Maintain automated rotation schedules and continue monitoring Certificate Transparency (CT) logs.',
      },
      {
        severity: 'INFORMATIONAL',
        title: 'Comprehensive Defense-in-Depth HTTP Headers',
        description:
          'Strict CSP, preloaded HSTS, X-Frame-Options DENY, and strict Referrer-Policy are enforced consistently.',
        recommendedAction: 'No defensive action needed. System meets OWASP Secure Headers Project standards.',
      },
      {
        severity: 'INFORMATIONAL',
        title: 'DNSSEC Signed & CAA Validated Zone',
        description:
          'Domain zone is cryptographically signed with NSEC3 records and restricts certificate issuance via CAA DNS records.',
        recommendedAction: 'Standard monitoring permitted.',
      },
    ]
  }

  // Ensure both plural and singular aliases and standard securityStatus structure exist
  if (dns) {
    dns.aRecord = dns.aRecords || []
    dns.aaaaRecord = dns.aaaaRecords || []
    dns.mxRecord = dns.mxRecords || []
    dns.nsRecord = dns.nsRecords || []
    dns.securityStatus = {
      status: dns.dnsSecurityStatus?.dnssecStatus === 'PASS' ? 'SECURE' : 'INSECURE',
      dnssec: dns.dnsSecurityStatus?.dnssecStatus === 'PASS',
      details: dns.dnsSecurityStatus?.dnssec || 'Not Configured',
    }
  }

  return {
    domain,
    cleanInput,
    isHttps,
    isPhish,
    isSuspicious,
    certificate,
    httpHeaders,
    dns,
    findings,
    simulatedDemo: true,
  }
}

