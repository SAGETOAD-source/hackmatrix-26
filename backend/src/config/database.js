const { Pool } = require("pg");

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || "threatlens_db",
      user: process.env.DB_USER || "threatlens_user",
      password: process.env.DB_PASSWORD,

      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

const pool = new Pool(poolConfig);

pool.on("connect", () => {
  console.log("PostgreSQL connection established");
});

pool.on("error", (error) => {
  const subErrors = Array.isArray(error.errors) ? error.errors.map(e => e.message || e.code).join(", ") : null;
  const msg = subErrors || error.message || error.code || "Unknown error";
  console.error("Unexpected PostgreSQL pool error:", msg);
});

module.exports = pool;