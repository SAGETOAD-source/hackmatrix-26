CREATE TABLE scans (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    url TEXT NOT NULL,
    normalized_url TEXT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    risk_score INTEGER,
    risk_level VARCHAR(20),

    verdict VARCHAR(30),

    analysis JSONB,

    error_message TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    CONSTRAINT scans_status_check
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

    CONSTRAINT scans_risk_score_check
        CHECK (risk_score IS NULL OR risk_score BETWEEN 0 AND 100)
);

CREATE INDEX idx_scans_user_created
ON scans(user_id, created_at DESC);

CREATE INDEX idx_scans_status
ON scans(status);