-- Fast case-insensitive lookup and safe re-seeding (no duplicate indicator per source)
CREATE UNIQUE INDEX IF NOT EXISTS uq_threat_intel_indicator_source
ON threat_intelligence (lower(indicator), source);

CREATE INDEX IF NOT EXISTS idx_threat_intel_indicator_lower
ON threat_intelligence (lower(indicator));
