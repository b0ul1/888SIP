-- ===================================================================
--  Database Initialization for VoIP Automation Platform
-- ===================================================================

-- Safety first
DROP TABLE IF EXISTS call_logs CASCADE;
DROP TABLE IF EXISTS bots CASCADE;

-- ===================================================================
--  TABLE: calls
--  Description: Tracks all automated and manual calls with metadata.
-- ===================================================================
CREATE TABLE call_logs (
    id SERIAL PRIMARY KEY,
    number VARCHAR(64) NOT NULL,                    -- destination SIP number
    status VARCHAR(32) NOT NULL DEFAULT 'initiated',-- call status
    start_time TIMESTAMP DEFAULT NOW(),             -- when the call started
    end_time TIMESTAMP,                             -- when the call ended
    tts_file VARCHAR(255),                          -- filename of the TTS WAV used
    duration_seconds INTEGER GENERATED ALWAYS AS
        (EXTRACT(EPOCH FROM (end_time - start_time))) STORED,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE call_logs IS 'Historical log of all SIP calls (automated + manual).';
COMMENT ON COLUMN call_logs.number IS 'SIP endpoint or phone number dialed.';
COMMENT ON COLUMN call_logs.status IS 'Call lifecycle: initiated, in_progress, completed, failed.';
COMMENT ON COLUMN call_logs.tts_file IS 'Path to the audio file generated via Google TTS.';


-- ===================================================================
--  TABLE: bots
--  Description: Defines preconfigured voice scripts and schedules.
-- ===================================================================
CREATE TABLE bots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    message TEXT NOT NULL,                          -- default spoken text
    voice VARCHAR(32) DEFAULT 'fr-FR-Female',
    target_number VARCHAR(64),                      -- number to call
    schedule_cron VARCHAR(64),                      -- CRON-style scheduling pattern
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE bots IS 'Stores automated TTS call scripts (bots) with scheduling info.';


-- ===================================================================
--  TABLE: system_events
--  Description: Logs backend events for monitoring (calls, errors, TTS).
-- ===================================================================
CREATE TABLE system_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,                -- e.g. CALL_START, CALL_END, ERROR
    payload JSONB,                                  -- structured metadata
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE system_events IS 'Generic backend event log for analytics and debugging.';


-- ===================================================================
--  Indexes and performance
-- ===================================================================
CREATE INDEX idx_call_logs_number ON call_logs(number);
CREATE INDEX idx_call_logs_status ON call_logs(status);
CREATE INDEX idx_bots_active ON bots(active);
CREATE INDEX idx_events_type ON system_events(event_type);

-- ===================================================================
--  Default test data
-- ===================================================================
INSERT INTO bots (name, message, voice, target_number)
VALUES
('TestBot', 'Bonjour, ceci est un test automatique de la plateforme.', 'fr-FR-Female', '1001');

-- ===================================================================
--  View for reporting
-- ===================================================================
CREATE OR REPLACE VIEW v_call_summary AS
SELECT
    DATE(start_time) AS call_date,
    COUNT(*) AS total_calls,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_calls,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_calls,
    ROUND(AVG(duration_seconds), 2) AS avg_duration_sec
FROM call_logs
GROUP BY 1
ORDER BY 1 DESC;

COMMENT ON VIEW v_call_summary IS 'Aggregated call statistics by day.';

-- ===================================================================
--  Done
-- ===================================================================
