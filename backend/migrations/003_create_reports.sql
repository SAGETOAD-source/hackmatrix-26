CREATE TABLE IF NOT EXISTS reports (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scan_id BIGINT NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    report_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_report_per_scan UNIQUE (user_id, scan_id)
);

CREATE INDEX IF NOT EXISTS idx_reports_user_created
ON reports(user_id, created_at DESC);