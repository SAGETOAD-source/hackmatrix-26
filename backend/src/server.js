const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = require("./app");
const pool = require("./config/database");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`ThreatLens API running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/v1/health`);

  // Non-blocking database connectivity check
  pool.query("SELECT 1")
    .then(() => {
      console.log("PostgreSQL database connected and ready.");
    })
    .catch((err) => {
      const subErrors = Array.isArray(err.errors) ? err.errors.map(e => e.message || e.code).join(", ") : null;
      const msg = subErrors || err.message || err.code || "Connection failed";
      console.warn(`[WARN] PostgreSQL database connection check failed: ${msg}. Check DB_HOST, DB_PORT, and DB credentials in backend/.env.`);
    });
});

async function shutdown() {
  console.log("Shutting down server...");

  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);