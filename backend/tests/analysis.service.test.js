const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { calculateUnifiedRiskScore } = require("../src/services/analysis.service");

describe("Unified Security Analysis & Scoring (analysis.service.js)", () => {
  test("calculates low risk for clean legitimate site with valid TLS and legitimate ML prediction", () => {
    const result = calculateUnifiedRiskScore({
      mlResult: {
        status: "success",
        prediction: "LEGITIMATE",
        confidence: 0.99,
        model: "RandomForest",
      },
      urlChars: {
        hasHttps: true,
        hasIpAddress: false,
        hasAtSymbol: false,
        isShortened: false,
        hasSuspiciousTld: false,
        subdomainCount: 1,
        matchedKeywords: [],
      },
      tlsStatus: {
        status: "valid",
        valid: true,
        authorized: true,
        isExpired: false,
      },
      httpStatus: {
        hsts: true,
        csp: true,
        xFrameOptions: "DENY",
        xContentTypeOptions: "nosniff",
        error: null,
      },
      threatMatches: [],
    });

    assert.ok(result.riskScore < 30);
    assert.equal(result.riskLevel, "low");
    assert.equal(result.verdict, "Safe");
    assert.equal(result.findings.length, 0);
  });

  test("calculates high/critical risk for phishing URL with phishing ML prediction and IP hostname", () => {
    const result = calculateUnifiedRiskScore({
      mlResult: {
        status: "success",
        prediction: "PHISHING",
        confidence: 0.98,
        model: "RandomForest",
      },
      urlChars: {
        hasHttps: false,
        hasIpAddress: true,
        hasAtSymbol: false,
        isShortened: false,
        hasSuspiciousTld: false,
        subdomainCount: 0,
        matchedKeywords: ["login", "banking"],
      },
      tlsStatus: null,
      httpStatus: { error: "unreachable" },
      threatMatches: [],
    });

    assert.ok(result.riskScore >= 60);
    assert.ok(["high", "critical"].includes(result.riskLevel));
    assert.equal(result.verdict, "Phishing");
    assert.ok(result.findings.some((f) => f.title.includes("ML Phishing")));
    assert.ok(result.findings.some((f) => f.title.includes("Raw IP Address")));
  });

  test("does not equate missing HTTPS with phishing", () => {
    const result = calculateUnifiedRiskScore({
      mlResult: {
        status: "success",
        prediction: "LEGITIMATE",
        confidence: 0.95,
        model: "RandomForest",
      },
      urlChars: {
        hasHttps: false, // HTTP only
        hasIpAddress: false,
        hasAtSymbol: false,
        isShortened: false,
        hasSuspiciousTld: false,
        subdomainCount: 0,
        matchedKeywords: [],
      },
      tlsStatus: null,
      httpStatus: {
        hsts: false,
        csp: false,
        xFrameOptions: null,
        xContentTypeOptions: null,
      },
      threatMatches: [],
    });

    // Score should reflect missing HTTPS posture deduction, but NOT classified as phishing!
    assert.notEqual(result.verdict, "Phishing");
    assert.ok(result.riskScore < 60);
  });

  test("handles ML service unavailable gracefully without marking URL safe merely because ML was offline", () => {
    const result = calculateUnifiedRiskScore({
      mlResult: {
        status: "unavailable",
        prediction: null,
        confidence: null,
        model: null,
        error: "ML service offline",
      },
      urlChars: {
        hasHttps: true,
        hasIpAddress: true, // IP hostname is a red flag!
        hasAtSymbol: true,  // '@' in URL is a red flag!
        isShortened: false,
        hasSuspiciousTld: false,
        subdomainCount: 0,
        matchedKeywords: ["login", "verify"],
      },
      tlsStatus: { valid: false, isExpired: true },
      httpStatus: { error: "unreachable" },
      threatMatches: [],
    });

    // Even with ML unavailable, other red flags should result in an elevated risk score
    assert.ok(result.riskScore >= 30);
    assert.ok(result.findings.some((f) => f.title.includes("ML Engine Offline")));
  });
});

