const pool = require("../config/database");

async function getIntelligence(req, res) {
  try {
    const { type, severity } = req.query;

    const conditions = [];
    const values = [];

    if (type) {
      values.push(type);
      conditions.push(`indicator_type = $${values.length}`);
    }

    if (severity) {
      values.push(severity);
      conditions.push(`severity = $${values.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await pool.query(
      `SELECT id, indicator, indicator_type, source,
              severity, description, first_seen, last_seen, created_at
       FROM threat_intelligence
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT 100`,
      values
    );

    return res.status(200).json({
      success: true,
      data: { intelligence: result.rows }
    });
  } catch (error) {
    console.error("Get intelligence error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve threat intelligence"
    });
  }
}

module.exports = { getIntelligence };