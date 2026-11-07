const pool = require("../config/database");

async function createScan(req, res) {
  try {
    const { url } = req.body;
    const userId = req.user.id;

    const normalizedUrl = new URL(url).toString();

    const result = await pool.query(
      `INSERT INTO scans (user_id, url, normalized_url)
       VALUES ($1, $2, $3)
       RETURNING id, url, status, created_at`,
      [userId, url, normalizedUrl]
    );

    return res.status(201).json({
      success: true,
      message: "Scan submitted successfully",
      data: { scan: result.rows[0] },
    });
  } catch (error) {
    console.error("Create scan error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function getScans(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, url, status, risk_score, risk_level, verdict, created_at, completed_at
       FROM scans
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: { scans: result.rows },
    });
  } catch (error) {
    console.error("Get scans error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function getScanById(req, res) {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scan ID",
      });
    }

    const result = await pool.query(
      `SELECT id, url, status, risk_score, risk_level, verdict,
              analysis, error_message, created_at, completed_at
       FROM scans
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Scan not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { scan: result.rows[0] },
    });
  } catch (error) {
    console.error("Get scan error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  createScan,
  getScans,
  getScanById,
};