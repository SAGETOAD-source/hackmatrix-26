const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const scanRoutes = require("./routes/scan.routes");
const reportRoutes = require("./routes/report.routes");
const intelligenceRoutes = require("./routes/intelligence.routes");
const app = express();

// Security middleware
app.use(helmet());

// Cross-origin configuration
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Request parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use("/api/v1/auth", authRoutes);
// Health check
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/scans", scanRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/intelligence", intelligenceRoutes);
module.exports = app;