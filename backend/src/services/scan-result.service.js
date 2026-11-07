const pool = require("../config/database");

async function saveScanResult(scanId, userId, result) {
  const {
    riskScore,
    riskLevel,
    verdict,
    analysis
  } = result;

  if (
    !Number.isInteger(riskScore) ||
    riskScore < 0 ||
    riskScore > 100
  ) {
    throw new Error("Invalid risk score");
  }

  if (!riskLevel || !verdict || !analysis || typeof analysis !== "object") {
    throw new Error("Incomplete analysis result");
  }

  const query = await pool.query(
    `UPDATE scans
     SET status = 'completed',
         risk_score = $1,
         risk_level = $2,
         verdict = $3,
         analysis = $4,
         error_message = NULL,
         completed_at = NOW()
     WHERE id = $5
       AND user_id = $6
       AND status IN ('pending', 'processing')
     RETURNING id, url, status, risk_score,
               risk_level, verdict, analysis, completed_at`,
    [
      riskScore,
      riskLevel,
      verdict,
      JSON.stringify(analysis),
      scanId,
      userId
    ]
  );

  if (query.rowCount === 0) {
    throw new Error("Scan not found or already processed");
  }

  return query.rows[0];
}

async function markScanFailed(scanId, userId, errorMessage) {
  const query = await pool.query(
    `UPDATE scans
     SET status = 'failed',
         error_message = $1,
         completed_at = NOW()
     WHERE id = $2
       AND user_id = $3
       AND status IN ('pending', 'processing')
     RETURNING id, status, error_message`,
    [
      String(errorMessage || "Analysis failed").slice(0, 1000),
      scanId,
      userId
    ]
  );

  if (query.rowCount === 0) {
    throw new Error("Scan not found or already processed");
  }

  return query.rows[0];
}

module.exports = {
  saveScanResult,
  markScanFailed
};