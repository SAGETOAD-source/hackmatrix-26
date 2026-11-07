const express = require("express");
const pool = require("../config/database");

const router = express.Router();

// API health check
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ThreatLens backend is running",
    service: "threatlens-api",
    timestamp: new Date().toISOString(),
  });
});

// Database health check
router.get("/database", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS database_time, current_database() AS database_name"
    );

    res.status(200).json({
      success: true,
      message: "Database connection successful",
      database: result.rows[0].database_name,
      timestamp: result.rows[0].database_time,
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(503).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

module.exports = router;