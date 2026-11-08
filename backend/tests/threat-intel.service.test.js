const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { buildCandidates, lookupThreatIntelligence } = require("../src/services/threat-intel.service");

describe("Threat intelligence lookup (threat-intel.service.js)", () => {
  test("buildCandidates covers url, hostname and parent domains, lower-cased", () => {
    const c = buildCandidates("Login.Evil.Example.COM", "http://Login.Evil.Example.COM/a");
    for (const x of ["http://login.evil.example.com/a", "login.evil.example.com", "evil.example.com", "example.com"]) {
      assert.ok(c.includes(x), `missing ${x}`);
    }
    assert.equal(c.includes("com"), false);
  });

  test("buildCandidates adds the URL without its trailing slash", () => {
    const c = buildCandidates("bad.xyz", "http://bad.xyz/");
    assert.ok(c.includes("http://bad.xyz/") && c.includes("http://bad.xyz"));
  });

  test("buildCandidates does not split IP addresses", () => {
    const c = buildCandidates("185.220.101.4", "http://185.220.101.4:8080/x");
    assert.deepEqual(c.filter((x) => !x.startsWith("http")), ["185.220.101.4"]);
  });

  test("lookup returns matching rows and passes the candidates to the query", async () => {
    let args;
    const fakeDb = { query: async (sql, params) => { args = params; return { rows: [{ id: 1, indicator: "evil.example.com" }] }; } };
    const rows = await lookupThreatIntelligence("a.evil.example.com", "http://a.evil.example.com/", fakeDb);
    assert.equal(rows.length, 1);
    assert.ok(args[0].includes("evil.example.com"));
  });

  test("lookup returns [] (and does not throw) when the database fails", async () => {
    const fakeDb = { query: async () => { throw new Error("db down"); } };
    const rows = await lookupThreatIntelligence("x.com", "http://x.com/", fakeDb);
    assert.deepEqual(rows, []);
  });
});
