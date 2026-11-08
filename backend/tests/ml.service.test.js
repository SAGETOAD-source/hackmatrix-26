const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { predictUrl, getMlServiceUrl } = require("../src/services/ml.service");

describe("ML Integration Service (ml.service.js)", () => {
  test("getMlServiceUrl returns configured or default URL", () => {
    const url = getMlServiceUrl();
    assert.ok(url);
    assert.match(url, /^https?:\/\//);
    assert.equal(url.endsWith("/"), false);
  });

  test("predictUrl rejects empty or null URL", async () => {
    const res1 = await predictUrl("");
    assert.equal(res1.status, "invalid_input");
    assert.equal(res1.prediction, null);

    const res2 = await predictUrl(null);
    assert.equal(res2.status, "invalid_input");
    assert.equal(res2.prediction, null);

    const res3 = await predictUrl("   ");
    assert.equal(res3.status, "invalid_input");
    assert.equal(res3.prediction, null);
  });

  test("predictUrl handles unreachable/unavailable ML service gracefully", async () => {
    // Override ML_SERVICE_URL to a non-existent port
    const originalEnv = process.env.ML_SERVICE_URL;
    process.env.ML_SERVICE_URL = "http://127.0.0.1:59999";

    try {
      const res = await predictUrl("https://example.com", { timeoutMs: 1000 });
      assert.equal(res.status, "unavailable");
      assert.equal(res.prediction, null);
      assert.equal(res.confidence, null);
      assert.ok(res.error);
    } finally {
      process.env.ML_SERVICE_URL = originalEnv;
    }
  });

  test("predictUrl handles timeout gracefully", async () => {
    // Point to non-routable address to force timeout
    const originalEnv = process.env.ML_SERVICE_URL;
    process.env.ML_SERVICE_URL = "http://10.255.255.1:8000";

    try {
      const res = await predictUrl("https://example.com", { timeoutMs: 100 });
      assert.equal(res.status, "unavailable");
      assert.equal(res.prediction, null);
      assert.ok(res.error.includes("timed out") || res.error.includes("unreachable"));
    } finally {
      process.env.ML_SERVICE_URL = originalEnv;
    }
  });

  test("predictUrl correctly parses a successful legitimate prediction from live ML service", async () => {
    // If local port 8000 is running
    const res = await predictUrl("https://www.google.com");
    if (res.status === "success") {
      assert.equal(res.prediction, "LEGITIMATE");
      assert.ok(typeof res.confidence === "number");
      assert.ok(res.confidence >= 0.5 && res.confidence <= 1.0);
      assert.equal(res.model, "RandomForest");
    } else {
      // If service is offline in this environment, it must report unavailable gracefully
      assert.equal(res.status, "unavailable");
      assert.equal(res.prediction, null);
    }
  });

  test("predictUrl correctly parses a successful phishing prediction from live ML service", async () => {
    const res = await predictUrl("http://188.128.111.33/iptv/tv1324/login.php?user=admin");
    if (res.status === "success") {
      assert.equal(res.prediction, "PHISHING");
      assert.ok(typeof res.confidence === "number");
      assert.ok(res.confidence >= 0.5 && res.confidence <= 1.0);
      assert.equal(res.model, "RandomForest");
    } else {
      assert.equal(res.status, "unavailable");
      assert.equal(res.prediction, null);
    }
  });
});

