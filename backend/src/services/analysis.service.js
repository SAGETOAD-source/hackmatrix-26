const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

async function analyzeUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(
      `${AI_SERVICE_URL}/api/v1/analyze/url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url }),
        signal: controller.signal
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "AI analysis service failed");
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { analyzeUrl };