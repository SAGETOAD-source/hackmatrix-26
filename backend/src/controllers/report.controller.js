const pool = require("../config/database");

async function createReport(req, res) {
  try {
    const { scanId, title, reportData } = req.body;

    const scan = await pool.query(
      `SELECT id FROM scans WHERE id = $1 AND user_id = $2 AND status = 'completed'`,
      [scanId, req.user.id]
    );

    if (scan.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Completed scan not found"
      });
    }

    const result = await pool.query(
      `INSERT INTO reports (user_id, scan_id, title, report_data)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, scan_id)
       DO UPDATE SET title = EXCLUDED.title,
                     report_data = EXCLUDED.report_data
       RETURNING id, scan_id, title, report_data, created_at`,
      [req.user.id, scanId, title, reportData]
    );

    return res.status(201).json({
      success: true,
      data: { report: result.rows[0] }
    });
  } catch (error) {
    console.error("Create report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create report"
    });
  }
}

async function getReports(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, scan_id, title, report_data, created_at
       FROM reports
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: { reports: result.rows }
    });
  } catch (error) {
    console.error("Get reports error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve reports"
    });
  }
}

async function getReportById(req, res) {
  try {
    if (!/^\d+$/.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID"
      });
    }

    const result = await pool.query(
      `SELECT id, scan_id, title, report_data, created_at
       FROM reports
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: { report: result.rows[0] }
    });
  } catch (error) {
    console.error("Get report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve report"
    });
  }
}

module.exports = { createReport, getReports, getReportById };