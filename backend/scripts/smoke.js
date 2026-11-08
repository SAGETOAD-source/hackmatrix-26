/**
 * End-to-end smoke test against a running backend.
 *   BASE_URL=http://localhost:5000/api/v1 npm run smoke
 * Checks: threat-intel table seeded, register/login, scan of a listed domain
 * (threat intel must fire), scan of google.com (must not), report create/list/get.
 */
const BASE = (process.env.BASE_URL || "http://localhost:5000/api/v1").replace(/\/+$/, "");
let failed = 0;
const ok = (name, cond, extra = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  -> " + extra : ""}`);
  if (!cond) failed++;
};

async function call(method, path, body, token) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(90000),
  });
  let json = null;
  try { json = await res.json(); } catch (_) {}
  return { status: res.status, json };
}

async function scanAndWait(url, token) {
  const created = await call("POST", "/scans", { url }, token);
  if (created.status !== 201) return { error: `create scan HTTP ${created.status}` };
  const id = created.json.data.scan.id;
  for (let i = 0; i < 45; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const s = await call("GET", `/scans/${id}`, null, token);
    const scan = s.json && s.json.data && s.json.data.scan;
    if (scan && scan.status === "completed") return { scan };
    if (scan && scan.status === "failed") return { error: scan.error_message || "scan failed" };
  }
  return { error: "scan timed out" };
}

(async () => {
  console.log(`Smoke test against ${BASE}\n`);
  const email = `smoke_${Date.now()}@example.com`;
  const password = "SmokeTest#12345";

  const intel = await call("GET", "/intelligence");
  const rows = (intel.json && intel.json.data && intel.json.data.intelligence) || [];
  ok("GET /intelligence returns indicators (table is seeded)", intel.status === 200 && rows.length > 0, `${rows.length} rows`);

  const reg = await call("POST", "/auth/register", { name: "Smoke Test", email, password });
  ok("register", reg.status === 201, `HTTP ${reg.status}`);
  const login = await call("POST", "/auth/login", { email, password });
  const token = login.json && login.json.data && login.json.data.token;
  ok("login returns token", login.status === 200 && !!token, `HTTP ${login.status}`);
  if (!token) return finish();

  const listed = await scanAndWait("http://paypal-secure-login.account-verify.xyz/signin", token);
  ok("scan of a listed domain completes", !!listed.scan, listed.error || "");
  let scanId = null;
  if (listed.scan) {
    scanId = listed.scan.id;
    const a = listed.scan.analysis || {};
    const ti = a.componentScores && a.componentScores.threatIntel;
    ok("threat intel component fires for listed domain (=100)", ti === 100, `threatIntel=${ti}`);
    ok("listed domain verdict is Phishing", listed.scan.verdict === "Phishing", `${listed.scan.verdict} (${listed.scan.risk_score})`);
  }

  const clean = await scanAndWait("https://google.com", token);
  ok("scan of google.com completes", !!clean.scan, clean.error || "");
  if (clean.scan) {
    const ti = clean.scan.analysis && clean.scan.analysis.componentScores && clean.scan.analysis.componentScores.threatIntel;
    ok("threat intel does NOT fire for google.com (=0)", ti === 0, `threatIntel=${ti}`);
    ok("google.com verdict is Safe", clean.scan.verdict === "Safe", `${clean.scan.verdict} (${clean.scan.risk_score})`);
  }

  if (scanId) {
    const rep = await call("POST", "/reports", { scanId, title: "Smoke test report", reportData: { note: "smoke", verdict: "Phishing" } }, token);
    ok("POST /reports creates a report", rep.status === 201, `HTTP ${rep.status}`);
    const reportId = rep.json && rep.json.data && rep.json.data.report && rep.json.data.report.id;
    const list = await call("GET", "/reports", null, token);
    const reports = (list.json && list.json.data && list.json.data.reports) || [];
    ok("GET /reports lists it", list.status === 200 && reports.some((r) => String(r.id) === String(reportId)), `${reports.length} report(s)`);
    const one = await call("GET", `/reports/${reportId}`, null, token);
    ok("GET /reports/:id returns it", one.status === 200, `HTTP ${one.status}`);
    const bad = await call("POST", "/reports", { scanId: 999999999, title: "x", reportData: {} }, token);
    ok("report for someone else's / missing scan is rejected (404)", bad.status === 404, `HTTP ${bad.status}`);
  }
  finish();
})().catch((e) => { console.error("Smoke test crashed:", e.message); process.exit(1); });

function finish() {
  console.log(failed ? `\n${failed} check(s) FAILED` : "\nAll checks passed");
  process.exit(failed ? 1 : 0);
}
