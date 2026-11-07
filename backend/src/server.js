require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`ThreatLens API running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/v1/health`);
});