const app = require("./app");
const pool = require("./config/database");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`ThreatLens API running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/v1/health`);
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