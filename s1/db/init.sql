-- ===================================================================
--  Database Initialization for 888SIP VoIP Automation Platform
-- ===================================================================

-- Safety first (comment out in production)
DROP TABLE IF EXISTS system_events CASCADE;
DROP TABLE IF EXISTS bots CASCADE;
DROP TABLE IF EXISTS calls CASCADE;

-- ===================================================================
--  TABLE: calls
--  Description: Logs all automated and manual calls with metadata.
-- ===================================================================
CREATE TABLE IF NOT EXISTS calls (
    id SERIAL PRIMARY KEY,
    number VARCHAR(64) NOT NULL,                     -- SIP endpoint or number dialed
    status VARCHAR(32) NOT NULL DEFAULT 'initiated', -- call status
    start_time TIMESTAMP DEFAULT NOW(),              -- when the call started
    end_time TIMESTAMP,                              -- when the call ended
    transcript TEXT,                                 -- text spoken (TTS content)
    tts_file VARCHAR(255),                           -- filename of the TTS WAV used
    duration_seconds INTEGER GENERATED ALWAYS AS
        (EXTRACT(EPOCH FROM (end_time - start_time))) STORED,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE calls IS 'Historical log of all SIP calls (automated + manual).';
COMMENT ON COLUMN calls.number IS 'SIP endpoint or phone number dialed.';
COMMENT ON COLUMN calls.status IS 'Call lifecycle: initiated, in_progress, completed, failed.';
COMMENT ON COLUMN calls.tts_file IS 'Path to the audio file generated via Google TTS.';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calls_number ON calls(number);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);

-- ===================================================================
--  TABLE: bots
--  Description: Defines preconfigured voice scripts and schedules.
-- ===================================================================
CREATE TABLE IF NOT EXISTS bots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    message TEXT NOT NULL,                           -- default spoken text
    voice VARCHAR(32) DEFAULT 'fr-FR-Wavenet-A',     -- default TTS voice
    target_number VARCHAR(64),                       -- number to call
    schedule_cron VARCHAR(64),                       -- CRON-style schedule
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE bots IS 'Stores automated TTS call scripts (bots) with scheduling info.';

CREATE INDEX IF NOT EXISTS idx_bots_active ON bots(active);

-- ===================================================================
--  TABLE: system_events
--  Description: Logs backend events for monitoring (calls, errors, TTS).
-- ===================================================================
CREATE TABLE IF NOT EXISTS system_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,                 -- e.g. CALL_START, CALL_END, ERROR
    payload JSONB,                                   -- structured metadata
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE system_events IS 'Generic backend event log for analytics and debugging.';
CREATE INDEX IF NOT EXISTS idx_events_type ON system_events(event_type);

-- ===================================================================
--  Default test bot
-- ===================================================================
INSERT INTO bots (name, message, voice, target_number)
VALUES
('TestBot', 'Bonjour, ceci est un test automatique de la plateforme 888SIP.', 'fr-FR-Wavenet-A', '1001');

-- ===================================================================
--  Reporting view
-- ===================================================================
CREATE OR REPLACE VIEW v_call_summary AS
SELECT
    DATE(start_time) AS call_date,
    COUNT(*) AS total_calls,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_calls,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_calls,
    ROUND(AVG(duration_seconds), 2) AS avg_duration_sec
FROM calls
GROUP BY 1
ORDER BY 1 DESC;

COMMENT ON VIEW v_call_summary IS 'Aggregated call statistics by day.';

-- ===================================================================
--  Done
-- ===================================================================
