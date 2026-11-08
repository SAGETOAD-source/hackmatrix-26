/**
 * ThreatLens Backend - Security Analysis & Risk Aggregation Service
 *
 * Orchestrates multi-layered security assessment:
 * 1. Lexical & URL Structural Analysis
 * 2. TLS/SSL Certificate Inspection
 * 3. HTTP Security Headers & Redirect Tracking
 * 4. DNS Record Inspection
 * 5. Threat Intelligence Lookup
 * 6. Machine Learning Phishing Classification (via ml.service.js)
 * 7. Unified Multi-Signal Risk Score Aggregation
 */

const tls = require("tls");
const dns = require("dns").promises;
const { predictUrl } = require("./ml.service");
const pool = require("../config/database");

const SHORTENER_DOMAINS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "is.gd",
  "buff.ly",
  "ow.ly",
  "cutt.ly",
  "tiny.cc",
  "rebrand.ly",
  "bl.ink",
  "shorturl.at",
  "rb.gy",
  "soo.gd",
]);

const SUSPICIOUS_KEYWORDS = [
  "login",
  "signin",
  "verify",
  "verification",
  "secure",
  "security",
  "account",
  "update",
  "banking",
  "authenticate",
  "confirm",
  "password",
  "wallet",
  "support",
  "billing",
  "recover",
  "paypal",
  "microsoft",
  "apple",
  "netflix",
];

const SUSPICIOUS_TLDS = new Set([
  "top",
  "xyz",
  "work",
  "click",
  "tk",
  "ml",
  "ga",
  "cf",
  "gq",
  "loan",
  "fit",
  "country",
  "buzz",
  "club",
  "cam",
  "live",
  "link",
  "surf",
  "icu",
  "monster",
]);

/**
 * Perform lexical and structural analysis of the URL
 */
function analyzeUrlStructure(urlObj, rawUrl) {
  const hostname = urlObj.hostname.toLowerCase();
  const pathname = urlObj.pathname;
  const rawLower = rawUrl.toLowerCase();

  const domainParts = hostname.split(".").filter(Boolean);
  const subdomainCount = domainParts.length > 2 ? domainParts.length - 2 : 0;
  const hasIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const hasAtSymbol = rawUrl.includes("@");
  const isShortened = SHORTENER_DOMAINS.has(hostname);
  const tld = domainParts.length > 0 ? domainParts[domainParts.length - 1] : "";
  const hasSuspiciousTld = SUSPICIOUS_TLDS.has(tld);

  const matchedKeywords = SUSPICIOUS_KEYWORDS.filter((kw) =>
    rawLower.includes(kw)
  );

  return {
    urlLength: rawUrl.length,
    domainLength: hostname.length,
    subdomainCount,
    hasHttps: urlObj.protocol === "https:",
    hasIpAddress,
    hasAtSymbol,
    isShortened,
    hasSuspiciousTld,
    tld,
    matchedKeywords,
    hasSuspiciousKeyword: matchedKeywords.length > 0,
    pathSegments: pathname.split("/").filter(Boolean).length,
  };
}

/**
 * Perform TLS/SSL Certificate inspection for HTTPS hosts
 */
async function inspectTlsCertificate(hostname, port = 443, timeoutMs = 4000) {
  return new Promise((resolve) => {
    let resolved = false;

    const socket = tls.connect(
      {
        host: hostname,
        port,
        servername: hostname,
        rejectUnauthorized: false,
        timeout: timeoutMs,
      },
      () => {
        if (resolved) return;
        resolved = true;

        try {
          const cert = socket.getPeerCertificate(true);
          const authorized = socket.authorized;
          const authorizationError = socket.authorizationError || null;

          socket.end();

          if (!cert || Object.keys(cert).length === 0) {
            return resolve({
              status: "no_certificate",
              valid: false,
              issuer: null,
              subject: null,
              validFrom: null,
              validTo: null,
              daysRemaining: 0,
              authorized: false,
              error: "No peer certificate presented",
            });
          }

          const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
          const validFrom = cert.valid_from ? new Date(cert.valid_from) : null;
          const now = new Date();
          const daysRemaining = validTo
            ? Math.round((validTo - now) / (1000 * 60 * 60 * 24))
            : null;

          const isExpired = daysRemaining !== null && daysRemaining <= 0;
          const isValid = authorized && !isExpired;

          return resolve({
            status: isValid ? "valid" : isExpired ? "expired" : "untrusted",
            valid: isValid,
            authorized,
            authorizationError,
            issuer: cert.issuer?.O || cert.issuer?.CN || "Unknown Issuer",
            subject: cert.subject?.CN || hostname,
            validFrom: validFrom ? validFrom.toISOString() : null,
            validTo: validTo ? validTo.toISOString() : null,
            daysRemaining,
            isExpired,
            serialNumber: cert.serialNumber || null,
            fingerprint256: cert.fingerprint256 || null,
          });
        } catch (err) {
          return resolve({
            status: "error",
            valid: false,
            authorized: false,
            error: err.message,
          });
        }
      }
    );

    const finishWithError = (errMessage) => {
      if (resolved) return;
      resolved = true;
      try {
        socket.destroy();
      } catch (_) {}
      resolve({
        status: "connection_failed",
        valid: false,
        authorized: false,
        error: errMessage,
      });
    };

    socket.on("timeout", () => finishWithError(`TLS handshake timed out after ${timeoutMs}ms`));
    socket.on("error", (err) => finishWithError(err.message));
  });
}

/**
 * Inspect DNS records for the domain with strict timeout and IP check
 */
async function inspectDns(hostname, timeoutMs = 2500) {
  const result = {
    domain: hostname,
    securityStatus: "neutral",
    aRecords: [],
    mxRecords: [],
    txtRecords: [],
    hasDnsSec: false,
    resolved: false,
    error: null,
  };

  // If hostname is a raw IPv4/IPv6, skip DNS lookup immediately
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(":")) {
    result.aRecords = [hostname];
    result.resolved = true;
    result.securityStatus = "raw_ip";
    return result;
  }

  const withTimeout = (p) =>
    Promise.race([
      p,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DNS timeout")), timeoutMs)
      ),
    ]);

  try {
    const [aRecords, mxRecords, txtRecords] = await Promise.all([
      withTimeout(dns.resolve4(hostname)).catch(() => []),
      withTimeout(dns.resolveMx(hostname)).catch(() => []),
      withTimeout(dns.resolveTxt(hostname)).catch(() => []),
    ]);

    result.aRecords = aRecords || [];
    result.resolved = result.aRecords.length > 0;
    result.mxRecords = (mxRecords || []).map((r) => r.exchange);
    result.txtRecords = (txtRecords || []).flat();

    const hasSpf = result.txtRecords.some((txt) =>
      txt.toLowerCase().startsWith("v=spf1")
    );
    const hasDmarc = result.txtRecords.some((txt) =>
      txt.toLowerCase().startsWith("v=dmarc1")
    );

    result.securityStatus =
      hasSpf || hasDmarc
        ? "protected"
        : result.resolved
        ? "neutral"
        : "unresolved";
  } catch (err) {
    result.error = err.message;
    result.securityStatus = "unresolved";
  }

  return result;
}

/**
 * Inspect HTTP headers and follow redirects safely
 */
async function inspectHttpHeaders(targetUrl, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const result = {
    finalUrl: targetUrl,
    statusCode: null,
    redirects: [],
    headers: {},
    hsts: false,
    csp: false,
    xFrameOptions: null,
    xContentTypeOptions: null,
    referrerPolicy: null,
    server: null,
    error: null,
  };

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "ThreatLens-Security-Scanner/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    result.finalUrl = response.url;
    result.statusCode = response.status;

    const headers = {};
    for (const [key, value] of response.headers.entries()) {
      headers[key.toLowerCase()] = value;
    }
    result.headers = headers;

    result.hsts = Boolean(headers["strict-transport-security"]);
    result.csp = Boolean(headers["content-security-policy"]);
    result.xFrameOptions = headers["x-frame-options"] || null;
    result.xContentTypeOptions = headers["x-content-type-options"] || null;
    result.referrerPolicy = headers["referrer-policy"] || null;
    result.server = headers["server"] || null;
  } catch (err) {
    result.error =
      err.name === "AbortError"
        ? `HTTP inspection timed out after ${timeoutMs}ms`
        : err.message;
  } finally {
    clearTimeout(timer);
  }

  return result;
}

/**
 * Check if domain or URL matches known indicators in threat_intelligence table
 */
async function lookupThreatIntelligence(hostname, targetUrl) {
  try {
    const query = `
      SELECT id, indicator, indicator_type, source, severity, description
      FROM threat_intelligence
      WHERE indicator = $1 OR indicator = $2
      LIMIT 10
    `;
    const res = await pool.query(query, [hostname, targetUrl]);
    return res.rows || [];
  } catch (err) {
    // If table doesn't exist or DB offline, return empty list gracefully
    return [];
  }
}

/**
 * Calculate multi-layer unified risk score (0-100)
 *
 * Weight Distribution:
 * - ML Phishing Prediction: 30%
 * - Domain & URL Intelligence: 20%
 * - Website Security Assessment (Headers): 15%
 * - TLS Certificate Assessment: 15%
 * - Threat Intelligence: 20%
 */
function calculateUnifiedRiskScore({
  mlResult,
  urlChars,
  tlsStatus,
  httpStatus,
  threatMatches,
}) {
  const findings = [];
  const componentScores = {};

  // 1. ML Component (Weight: 30%)
  let mlScore = null;
  if (mlResult.status === "success" && mlResult.prediction) {
    const conf = mlResult.confidence ?? 0.5;
    if (mlResult.prediction === "PHISHING") {
      mlScore = Math.round(conf * 100);
      findings.push({
        title: "ML Phishing Classification",
        description: `ML ensemble (Random Forest + character n-gram) classified URL as PHISHING with ${(conf * 100).toFixed(1)}% confidence.`,
        severity: "critical",
      });
    } else {
      mlScore = Math.round((1 - conf) * 100);
    }

    if (mlResult.tier && mlResult.tier !== "low_risk" && Array.isArray(mlResult.reasons)) {
      for (const reason of mlResult.reasons) {
        findings.push({
          title: "ML signal",
          description: reason,
          severity: "medium",
        });
      }
    }
  } else if (mlResult.status === "unavailable") {
    findings.push({
      title: "ML Engine Offline",
      description: "FastAPI Machine Learning service was unreachable during this scan.",
      severity: "info",
    });
  }
  componentScores.ml = mlScore;
  componentScores.mlAnalysis = mlScore;

  // 2. Domain & Lexical Component (Weight: 20%)
  let lexicalScore = 0;
  if (urlChars.hasIpAddress) {
    lexicalScore += 45;
    findings.push({
      title: "Raw IP Address in Hostname",
      description: "Host specifies an IP address instead of a domain name.",
      severity: "high",
    });
  }
  if (urlChars.hasAtSymbol) {
    lexicalScore += 30;
    findings.push({
      title: "Embedded '@' Symbol in URL",
      description: "URL uses '@' symbol which can obscure destination host.",
      severity: "high",
    });
  }
  if (urlChars.isShortened) {
    lexicalScore += 25;
    findings.push({
      title: "Known URL Shortener",
      description: "Destination is obscured behind a URL shortening service.",
      severity: "medium",
    });
  }
  if (urlChars.hasSuspiciousTld) {
    lexicalScore += 25;
    findings.push({
      title: "High-Abuse Top-Level Domain",
      description: `Domain uses .${urlChars.tld}, a TLD with high frequency of malicious abuse.`,
      severity: "medium",
    });
  }
  if (urlChars.subdomainCount >= 3) {
    lexicalScore += 20;
    findings.push({
      title: "Excessive Subdomains",
      description: `URL contains ${urlChars.subdomainCount} subdomains.`,
      severity: "medium",
    });
  }
  if (urlChars.matchedKeywords.length >= 2) {
    lexicalScore += 25;
    findings.push({
      title: "Credential Harvesting Keywords",
      description: `URL contains targeted security terms: ${urlChars.matchedKeywords.slice(0, 3).join(", ")}.`,
      severity: "high",
    });
  }
  lexicalScore = Math.min(100, lexicalScore);
  componentScores.lexical = lexicalScore;
  componentScores.domainLexical = lexicalScore;

  // 3. TLS Certificate Component (Weight: 15%)
  let tlsScore = 0;
  if (!urlChars.hasHttps) {
    tlsScore = 30; // Missing encryption posture deduction (does NOT equate to phishing)
    findings.push({
      title: "Unencrypted Connection (HTTP Only)",
      description: "Traffic is transmitted in cleartext without TLS certificate validation.",
      severity: "medium",
    });
  } else if (tlsStatus) {
    if (tlsStatus.isExpired) {
      tlsScore = 70;
      findings.push({
        title: "Expired SSL/TLS Certificate",
        description: `Certificate expired on ${tlsStatus.validTo}.`,
        severity: "high",
      });
    } else if (tlsStatus.authorized === false) {
      tlsScore = 60;
      findings.push({
        title: "Untrusted / Self-Signed Certificate",
        description: tlsStatus.authorizationError || "Certificate authority is not trusted.",
        severity: "high",
      });
    } else if (tlsStatus.valid) {
      tlsScore = 0;
    }
  }
  componentScores.tls = tlsScore;
  componentScores.tlsCertificate = tlsScore;

  // 4. HTTP Security Headers Component (Weight: 15%)
  let headersScore = 0;
  if (httpStatus && !httpStatus.error) {
    if (!httpStatus.hsts && urlChars.hasHttps) {
      headersScore += 20;
    }
    if (!httpStatus.csp) {
      headersScore += 20;
    }
    if (!httpStatus.xFrameOptions) {
      headersScore += 15;
    }
    if (!httpStatus.xContentTypeOptions) {
      headersScore += 15;
    }
  } else {
    headersScore = 20; // Default baseline deduction when remote site unreachable
  }
  headersScore = Math.min(100, headersScore);
  componentScores.headers = headersScore;
  componentScores.webSecurity = headersScore;

  // 5. Threat Intelligence Component (Weight: 20%)
  // Threat intel feeds (e.g. blacklists) alert on confirmed indicators.
  // If matched, it contributes max threat score (100). If unlisted/unknown,
  // it is not artificially diluting other signals.
  let threatScore = null;
  if (threatMatches && threatMatches.length > 0) {
    threatScore = 100;
    findings.push({
      title: "Known Malicious Indicator Match",
      description: `Domain matched ${threatMatches.length} threat intelligence record(s).`,
      severity: "critical",
    });
  } else {
    threatScore = null;
  }
  componentScores.threatIntel = threatScore !== null ? threatScore : 0;

  // Aggregate weighted score
  // If ML is unavailable, re-normalize available weights so risk reflects other signals
  let totalWeight = 0;
  let weightedSum = 0;

  const weights = [
    { score: mlScore, weight: 0.30 },
    { score: lexicalScore, weight: 0.20 },
    { score: tlsScore, weight: 0.15 },
    { score: headersScore, weight: 0.15 },
    { score: threatScore, weight: 0.20 },
  ];

  for (const item of weights) {
    if (item.score !== null) {
      weightedSum += item.score * item.weight;
      totalWeight += item.weight;
    }
  }

  const riskScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  const clampedRiskScore = Math.max(0, Math.min(100, riskScore));

  let riskLevel = "low";
  let verdict = "Safe";

  if (clampedRiskScore >= 75) {
    riskLevel = "critical";
    verdict = "Phishing";
  } else if (clampedRiskScore >= 50) {
    riskLevel = "high";
    verdict = "Phishing";
  } else if (clampedRiskScore >= 40) {
    riskLevel = "medium";
    verdict = "Suspicious";
  } else {
    riskLevel = "low";
    verdict = "Safe";
  }

  return {
    riskScore: clampedRiskScore,
    riskLevel,
    verdict,
    componentScores,
    findings,
  };
}

/**
 * Execute full scan pipeline on a submitted URL
 * @param {string} rawUrl
 * @returns {Promise<object>} Complete scan analysis payload
 */
async function analyzeUrl(rawUrl) {
  const urlObj = new URL(rawUrl);
  const hostname = urlObj.hostname;

  // 1. URL & Lexical Features
  const urlChars = analyzeUrlStructure(urlObj, rawUrl);

  // 2. Concurrently execute independent security checks
  const [mlResult, tlsStatus, dnsStatus, httpStatus, threatMatches] =
    await Promise.all([
      predictUrl(rawUrl),
      urlObj.protocol === "https:"
        ? inspectTlsCertificate(hostname, Number(urlObj.port) || 443)
        : Promise.resolve({
            status: "not_applicable",
            valid: false,
            authorized: false,
            reason: "HTTP protocol (no TLS)",
          }),
      inspectDns(hostname),
      inspectHttpHeaders(rawUrl),
      lookupThreatIntelligence(hostname, rawUrl),
    ]);

  // 3. Aggregate unified risk score
  const riskAssessment = calculateUnifiedRiskScore({
    mlResult,
    urlChars,
    tlsStatus,
    httpStatus,
    threatMatches,
  });

  // 4. Construct recommendations based on findings
  const recommendations = [
    urlChars.hasHttps
      ? "Verify SSL/TLS certificate chain against authorized root certificates."
      : "Enable HTTPS with HSTS to prevent cleartext interception and downgrades.",
    "Inspect HTTP response headers for missing HSTS, CSP, and X-Frame-Options.",
    "Cross-reference domain with active threat intelligence feeds.",
  ];

  if (mlResult.prediction === "PHISHING") {
    recommendations.unshift(
      "Exercise extreme caution: URL exhibits high lexical correlation with active phishing campaigns."
    );
  }

  return {
    risk_score: riskAssessment.riskScore,
    riskScore: riskAssessment.riskScore,
    risk_level: riskAssessment.riskLevel,
    riskLevel: riskAssessment.riskLevel,
    verdict: riskAssessment.verdict,
    prediction: riskAssessment.verdict,
    analysis: {
      ml_analysis: {
        prediction: mlResult.prediction,
        confidence: mlResult.confidence,
        model: mlResult.model,
        status: mlResult.status,
        error: mlResult.error || null,
        tier: mlResult.tier ?? null,
        risk_score: mlResult.riskScore != null ? mlResult.riskScore : (mlResult.risk_score != null ? mlResult.risk_score : null),
        reasons: Array.isArray(mlResult.reasons) ? mlResult.reasons : [],
      },
      url_characteristics: {
        urlLength: urlChars.urlLength,
        domainLength: urlChars.domainLength,
        subdomainCount: urlChars.subdomainCount,
        hasHttps: urlChars.hasHttps,
        hasIpAddress: urlChars.hasIpAddress,
        hasAtSymbol: urlChars.hasAtSymbol,
        hasSuspiciousKeyword: urlChars.hasSuspiciousKeyword,
        matchedKeywords: urlChars.matchedKeywords,
        isShortened: urlChars.isShortened,
      },
      ssl_status: tlsStatus,
      certificate: tlsStatus,
      http_headers: httpStatus,
      httpHeaders: httpStatus,
      dns: dnsStatus,
      suspicious_indicators: riskAssessment.findings,
      findings: riskAssessment.findings,
      recommendations,
      component_scores: riskAssessment.componentScores,
    },
  };
}

module.exports = {
  analyzeUrl,
  calculateUnifiedRiskScore,
};
