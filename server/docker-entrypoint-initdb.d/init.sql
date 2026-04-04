/*
  PostgreSQL database schema for OnTime server
*/

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gateways (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS towers (
    id TEXT PRIMARY KEY,
    gateway_id TEXT NOT NULL,
    name TEXT NOT NULL,
    stop_slug TEXT NOT NULL,
    line_name TEXT NOT NULL,
    battery_voltage REAL DEFAULT NULL,
    last_seen TIMESTAMPTZ DEFAULT NULL,
    FOREIGN KEY (gateway_id) REFERENCES gateways(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stops (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    display_ascii TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lines (
    id SERIAL PRIMARY KEY,
    pid_id INTEGER NOT NULL,
    gtfs_id TEXT NOT NULL,
    name TEXT NOT NULL,
    display_ascii TEXT NOT NULL,
    type TEXT NOT NULL,
    direction TEXT NOT NULL,
    stop_slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (pid_id, gtfs_id, stop_slug)
);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON gateways FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON towers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON lines FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON stops FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================== MOCK DATA ====================

-- Create mock user
INSERT INTO users (username, password_hash, email) 
VALUES ('mock_user', 'hashed_password', 'mock@example.com')
ON CONFLICT (username) DO NOTHING;

-- Create mock gateway
INSERT INTO gateways (id, user_id, name) 
VALUES ('c1895bf80e2b', (SELECT id FROM users WHERE username = 'mock_user'), 'Mock Gateway')
ON CONFLICT (id) DO NOTHING;

-- Insert stops
INSERT INTO stops (slug, name, display_ascii) 
VALUES 
    ('vysocanska', 'Vysočanská', 'Vysocanska'),
    ('albertov', 'Albertov', 'Albertov'),
    ('kolbenova', 'Kolbenova', 'Kolbenova')
ON CONFLICT (slug) DO NOTHING;

-- Insert lines with stop_slug (each line-stop pair has its own GTFS ID)
-- Vysocanska - Bus 136 (GTFS: U474Z6P)
INSERT INTO lines (pid_id, gtfs_id, name, display_ascii, type, direction, stop_slug)
VALUES (486, 'U474Z6P', '136', '136', 'bus', 'Sídliště Čakovice', 'vysocanska')
ON CONFLICT (pid_id, gtfs_id, stop_slug) DO NOTHING;

-- Vysocanska - Tram 12 (GTFS: U474Z2P)
INSERT INTO lines (pid_id, gtfs_id, name, display_ascii, type, direction, stop_slug)
VALUES (212, 'U474Z2P', '12', '12', 'tram', 'Lehovec', 'vysocanska')
ON CONFLICT (pid_id, gtfs_id, stop_slug) DO NOTHING;

-- Vysocanska - Bus 152 (GTFS: U474Z5P)
INSERT INTO lines (pid_id, gtfs_id, name, display_ascii, type, direction, stop_slug)
VALUES (487, 'U474Z5P', '152', '152', 'bus', 'Českomoravská', 'vysocanska')
ON CONFLICT (pid_id, gtfs_id, stop_slug) DO NOTHING;

-- Kolbenova - Metro B (GTFS: U75Z101P)
INSERT INTO lines (pid_id, gtfs_id, name, display_ascii, type, direction, stop_slug)
VALUES (992, 'U75Z101P', 'B', 'B', 'metro', 'Zličín', 'kolbenova')
ON CONFLICT (pid_id, gtfs_id, stop_slug) DO NOTHING;

-- Albertov - Bus 177 (GTFS: U474Z1P)
INSERT INTO lines (pid_id, gtfs_id, name, display_ascii, type, direction, stop_slug)
VALUES (485, 'U474Z1P', '177', '177', 'bus', 'Chodov', 'albertov')
ON CONFLICT (pid_id, gtfs_id, stop_slug) DO NOTHING;

-- Create mock towers
INSERT INTO towers (id, gateway_id, name, stop_slug, line_name, battery_voltage, last_seen) 
VALUES
    ('547c65321d0b', 'c1895bf80e2b', 'Mock Tower 1', 'vysocanska', '136', 85.5, NOW()),
    ('547c65321d0c', 'c1895bf80e2b', 'Mock Tower 2', 'kolbenova', 'B', 92.3, NOW())
ON CONFLICT (id) DO NOTHING;