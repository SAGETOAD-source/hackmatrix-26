/**
 * Seed the threat_intelligence table.
 *   npm run seed            -> demo indicators from seeds/threat_intel_seed.json
 *   npm run seed -- --feed  -> also download the OpenPhish public feed (full phishing URLs)
 * Safe to re-run: existing (indicator, source) pairs are skipped.
 */
const path = require("path");
const fs = require("fs");

const envPath = path.resolve(__dirname, "../../.env");
if (fs.existsSync(envPath)) require("dotenv").config({ path: envPath });
else require("dotenv").config();

const pool = require("./database");

const FEED_URL = "https://openphish.com/feed.txt";

async function insertMany(rows) {
  let inserted = 0;
  for (const r of rows) {
    const res = await pool.query(
      `INSERT INTO threat_intelligence
         (indicator, indicator_type, source, severity, description, first_seen, last_seen)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (lower(indicator), source) DO UPDATE SET last_seen = NOW()
       RETURNING (xmax = 0) AS inserted`,
      [r.indicator.trim(), r.indicator_type, r.source, r.severity || "high", r.description || null]
    );
    if (res.rows[0] && res.rows[0].inserted) inserted++;
  }
  return inserted;
}

async function loadOpenPhish() {
  const res = await fetch(FEED_URL, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`OpenPhish feed returned HTTP ${res.status}`);
  const lines = (await res.text()).split(/\r?\n/).map((l) => l.trim()).filter((l) => /^https?:\/\//i.test(l));
  return lines.map((u) => ({
    indicator: u.slice(0, 2048),
    indicator_type: "url",
    source: "OpenPhish",
    severity: "high",
    description: "Listed in the OpenPhish public phishing feed.",
  }));
}

async function main() {
  const seedFile = path.resolve(__dirname, "../../seeds/threat_intel_seed.json");
  const demo = JSON.parse(fs.readFileSync(seedFile, "utf8"));
  const added = await insertMany(demo);
  console.log(`Demo indicators: ${added} new (of ${demo.length}).`);

  if (process.argv.includes("--feed")) {
    try {
      const feed = await loadOpenPhish();
      const n = await insertMany(feed);
      console.log(`OpenPhish: ${n} new (of ${feed.length}).`);
    } catch (err) {
      console.error(`OpenPhish feed skipped: ${err.message}`);
    }
  }

  const { rows } = await pool.query("SELECT source, COUNT(*)::int AS n FROM threat_intelligence GROUP BY source ORDER BY source");
  console.log("threat_intelligence now holds:");
  rows.forEach((r) => console.log(`  ${r.source}: ${r.n}`));
  await pool.end();
}

main().catch(async (err) => {
  console.error("Seed failed:", err.message);
  try { await pool.end(); } catch (_) {}
  process.exit(1);
});
