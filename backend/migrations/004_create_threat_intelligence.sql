CREATE TABLE IF NOT EXISTS threat_intelligence (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    indicator VARCHAR(2048) NOT NULL,
    indicator_type VARCHAR(50) NOT NULL,
    source VARCHAR(255) NOT NULL,
    severity VARCHAR(20),
    description TEXT,
    first_seen TIMESTAMPTZ,
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_threat_intelligence_type
ON threat_intelligence(indicator_type);

CREATE INDEX IF NOT EXISTS idx_threat_intelligence_created
ON threat_intelligence(created_at DESC);