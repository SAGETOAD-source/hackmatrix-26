const path = require("path");
const fs = require("fs");

// Ensure environment variables are loaded from backend/.env regardless of CWD
const envPath = path.resolve(__dirname, "../../.env");
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
} else {
  require("dotenv").config();
}

const pool = require("./database");

/**
 * Safely verify required environment variables without logging secrets.
 */
function verifyEnvironmentVariables() {
  console.log("--- Database Environment Verification ---");

  if (process.env.DATABASE_URL) {
    // Mask credentials in connection string
    const maskedUrl = process.env.DATABASE_URL.replace(
      /:([^@]+)@/,
      ":****@"
    );
    console.log(`✓ DATABASE_URL: Configured (${maskedUrl})`);
    return { ok: true };
  }

  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT || "5432";
  const dbName = process.env.DB_NAME || "threatlens_db";
  const user = process.env.DB_USER || "threatlens_user";
  const password = process.env.DB_PASSWORD;

  console.log(`  DB_HOST:     ${host}`);
  console.log(`  DB_PORT:     ${port}`);
  console.log(`  DB_NAME:     ${dbName}`);
  console.log(`  DB_USER:     ${user}`);

  let passwordStatus = "[NOT SET]";
  let isPlaceholder = false;

  if (password) {
    if (password === "replace_with_your_local_password") {
      passwordStatus = "[PLACEHOLDER - 'replace_with_your_local_password']";
      isPlaceholder = true;
    } else {
      passwordStatus = `[CONFIGURED - ${password.length} characters]`;
    }
  }
  console.log(`  DB_PASSWORD: ${passwordStatus}`);
  console.log("-----------------------------------------");

  if (isPlaceholder) {
    console.warn("⚠ WARNING: DB_PASSWORD contains the placeholder 'replace_with_your_local_password'.");
    console.warn("  Please update backend/.env with your actual local PostgreSQL user password.");
  }

  if (!password && !process.env.DATABASE_URL) {
    console.warn("⚠ WARNING: DB_PASSWORD is not set. Local PostgreSQL authentication may fail if password is required.");
  }

  return { ok: true, host, port, dbName, user, isPlaceholder };
}

/**
 * Format database and connection errors with maximum diagnostic detail.
 */
function formatMigrationError(error) {
  if (!error) return "Unknown error";

  const lines = [];

  // Unroll AggregateError (Node.js multi-address socket attempts, e.g. IPv6 ::1 and IPv4 127.0.0.1)
  if (Array.isArray(error.errors) && error.errors.length > 0) {
    const subDetails = error.errors.map((e) => {
      const code = e.code ? `[${e.code}] ` : "";
      const msg = e.message || String(e);
      return `  • ${code}${msg}`;
    });
    lines.push(`Aggregate connection failure (${error.errors.length} attempted addresses):\n${subDetails.join("\n")}`);
  } else if (error.message && error.message.trim() !== "") {
    lines.push(`Message: ${error.message}`);
  }

  // Database error codes & diagnostic fields
  if (error.code) {
    lines.push(`Error Code: ${error.code}`);

    // Contextual diagnostics for common failure scenarios
    if (error.code === "ECONNREFUSED") {
      lines.push("Diagnosis: Connection refused. PostgreSQL server is not running or not listening on the configured host/port.");
      lines.push("Remediation: Ensure PostgreSQL is installed and started (e.g. Windows service, Docker container, or local service).");
    } else if (error.code === "EACCES") {
      lines.push("Diagnosis: Permission denied when attempting to open a network socket.");
    } else if (error.code === "28P01") {
      lines.push("Diagnosis: Password authentication failed for user. Verify DB_USER and DB_PASSWORD in backend/.env.");
    } else if (error.code === "3D000") {
      lines.push("Diagnosis: Database does not exist. Ensure the database specified in DB_NAME has been created in PostgreSQL.");
    } else if (error.code === "ENOTFOUND") {
      lines.push("Diagnosis: Database host name could not be resolved. Verify DB_HOST in backend/.env.");
    } else if (error.code === "ETIMEDOUT") {
      lines.push("Diagnosis: Connection attempt timed out. Check network routing and firewall settings.");
    }
  }

  if (error.detail) lines.push(`Detail: ${error.detail}`);
  if (error.hint) lines.push(`Hint: ${error.hint}`);
  if (error.position) lines.push(`Position: ${error.position}`);
  if (error.where) lines.push(`Where: ${error.where}`);
  if (error.schema) lines.push(`Schema: ${error.schema}`);
  if (error.table) lines.push(`Table: ${error.table}`);
  if (error.column) lines.push(`Column: ${error.column}`);

  if (error.stack) {
    lines.push(`\nStack Trace:\n${error.stack}`);
  }

  return lines.join("\n");
}

async function runMigrations() {
  verifyEnvironmentVariables();

  console.log("Connecting to PostgreSQL...");
  const client = await pool.connect();
  console.log("✓ Connected to PostgreSQL successfully.");

  try {
    // 1. Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // 2. Discover and sort migration SQL files
    const migrationsDir = path.join(__dirname, "../../migrations");

    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`Migrations directory not found at: ${migrationsDir}`);
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    console.log(`Found ${files.length} migration file(s) in ${migrationsDir}`);

    // 3. Execute each pending migration in a transaction
    for (const file of files) {
      const result = await client.query(
        "SELECT 1 FROM schema_migrations WHERE filename = $1",
        [file]
      );

      if (result.rowCount > 0) {
        console.log(`[SKIP] Already applied: ${file}`);
        continue;
      }

      console.log(`[APPLYING] ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

      await client.query("BEGIN");

      try {
        await client.query(sql);

        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [file]
        );

        await client.query("COMMIT");
        console.log(`[DONE] Applied migration: ${file}`);
      } catch (migrationError) {
        await client.query("ROLLBACK");
        console.error(`✗ Error occurred while executing migration file "${file}":`);
        throw migrationError;
      }
    }

    // 4. Verify resulting schema tables
    console.log("\nVerifying database schema...");
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const tableNames = tablesResult.rows.map((row) => row.table_name);
    console.log(`Public tables found (${tableNames.length}): ${tableNames.join(", ") || "(none)"}`);

    const hasUsersTable = tableNames.includes("users");
    if (hasUsersTable) {
      console.log("✓ 'users' table confirmed — authentication and registration ready.");
    } else {
      console.warn("⚠ Warning: 'users' table was not found in the public schema.");
    }

    console.log("\n✓ Database migrations completed successfully.");
  } finally {
    client.release();
  }
}

runMigrations()
  .catch((error) => {
    console.error("\n================ MIGRATION FAILED ================");
    console.error(formatMigrationError(error));
    console.error("==================================================\n");
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
