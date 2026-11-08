/**
 * ThreatLens Backend - ML Phishing Detection Integration Service
 *
 * Connects to the Python FastAPI ML microservice at ML_SERVICE_URL (default: http://127.0.0.1:8000).
 * Calls POST /predict with payload: { url }
 *
 * Provides:
 * - URL format validation
 * - Request timeouts via AbortController
 * - Error isolation and graceful degradation when ML service is offline
 * - Guaranteed non-fabrication of ML results
 */

const ML_SERVICE_DEFAULT_URL = "http://127.0.0.1:8000";
const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Resolve the base URL for the ML service from environment variables.
 * @returns {string} Clean base URL without trailing slash
 */
function getMlServiceUrl() {
  const url =
    process.env.ML_SERVICE_URL ||
    process.env.AI_SERVICE_URL ||
    ML_SERVICE_DEFAULT_URL;
  return url.replace(/\/+$/, "");
}

/**
 * Request ML phishing prediction from FastAPI microservice
 * @param {string} url The target URL to analyze
 * @param {object} [options]
 * @param {number} [options.timeoutMs=5000] Request timeout in milliseconds
 * @returns {Promise<{
 *   status: 'success' | 'unavailable' | 'invalid_input' | 'error',
 *   prediction: 'PHISHING' | 'LEGITIMATE' | null,
 *   confidence: number | null,
 *   model: string | null,
 *   error?: string
 * }>}
 */
async function predictUrl(url, options = {}) {
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const baseUrl = getMlServiceUrl();
  const endpoint = `${baseUrl}/predict`;

  if (!url || typeof url !== "string" || !url.trim()) {
    return {
      status: "invalid_input",
      prediction: null,
      confidence: null,
      model: null,
      error: "URL is required and must be a non-empty string",
    };
  }

  const targetUrl = url.trim();
  const controller = new AbortController();
  const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ url: targetUrl }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 400 || response.status === 422) {
        return {
          status: "invalid_input",
          prediction: null,
          confidence: null,
          model: null,
          error:
            (data && (data.detail || data.message)) ||
            `Invalid URL submitted to ML service (HTTP ${response.status})`,
        };
      }

      return {
        status: "unavailable",
        prediction: null,
        confidence: null,
        model: null,
        error: `ML service returned HTTP ${response.status}`,
      };
    }

    if (!data || typeof data !== "object") {
      return {
        status: "error",
        prediction: null,
        confidence: null,
        model: null,
        error: "Malformed response payload from ML service",
      };
    }

    const rawPrediction = data.ml_prediction;
    const rawConfidence = data.ml_confidence;
    const model = data.model || "RandomForest";

    // Validate prediction label
    if (rawPrediction !== "PHISHING" && rawPrediction !== "LEGITIMATE") {
      return {
        status: "error",
        prediction: null,
        confidence: null,
        model: null,
        error: "Unrecognized prediction label from ML service",
      };
    }

    // Validate confidence score
    const confidence =
      typeof rawConfidence === "number" && !isNaN(rawConfidence)
        ? Math.max(0, Math.min(1, Math.round(rawConfidence * 10000) / 10000))
        : null;

    return {
      status: "success",
      prediction: rawPrediction,
      confidence,
      model: String(model),
    };
  } catch (err) {
    if (err.name === "AbortError") {
      return {
        status: "unavailable",
        prediction: null,
        confidence: null,
        model: null,
        error: `ML service request timed out after ${timeoutMs}ms`,
      };
    }

    return {
      status: "unavailable",
      prediction: null,
      confidence: null,
      model: null,
      error: "ML service is unreachable or offline",
    };
  } finally {
    clearTimeout(timeoutTimer);
  }
}

module.exports = {
  predictUrl,
  getMlServiceUrl,
};

