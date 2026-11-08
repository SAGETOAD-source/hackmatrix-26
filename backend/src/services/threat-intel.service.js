const pool = require("../config/database");

/**
 * Build every string that could appear in threat_intelligence.indicator for a scan:
 * the full URL (with and without trailing slash), the hostname, and each parent
 * domain of the hostname (a.b.example.com -> b.example.com, example.com).
 * Everything is lower-cased. IP addresses are matched as-is only.
 */
function buildCandidates(hostname, targetUrl) {
  const out = new Set();
  const host = String(hostname || "").trim().toLowerCase().replace(/\.$/, "");
  const url = String(targetUrl || "").trim().toLowerCase();

  if (url) {
    out.add(url);
    out.add(url.replace(/\/+$/, ""));
  }
  if (host) {
    out.add(host);
    const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":");
    if (!isIp) {
      const labels = host.split(".");
      for (let i = 1; i < labels.length - 1; i++) {
        out.add(labels.slice(i).join("."));
      }
    }
  }
  return [...out];
}

/**
 * Look up threat_intelligence rows matching the scan target.
 * Returns [] when nothing matches. Lookup errors are logged (not swallowed
 * silently) and also return [] so a database hiccup never breaks a scan.
 */
async function lookupThreatIntelligence(hostname, targetUrl, db = pool) {
  const candidates = buildCandidates(hostname, targetUrl);
  if (candidates.length === 0) return [];
  try {
    const res = await db.query(
      `SELECT id, indicator, indicator_type, source, severity, description
       FROM threat_intelligence
       WHERE lower(indicator) = ANY($1::text[])
       ORDER BY created_at DESC
       LIMIT 10`,
      [candidates]
    );
    return res.rows || [];
  } catch (err) {
    console.error("Threat intelligence lookup failed:", err.message);
    return [];
  }
}

module.exports = { buildCandidates, lookupThreatIntelligence };
