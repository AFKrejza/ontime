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
    stop_slug TEXT,
    line_name TEXT,
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (pid_id, gtfs_id)
);

-- Junction table for many-to-many relationship between stops and lines
CREATE TABLE IF NOT EXISTS stops_lines (
    stop_id INTEGER NOT NULL,
    line_id INTEGER NOT NULL,
    PRIMARY KEY (stop_id, line_id),
    FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE,
    FOREIGN KEY (line_id) REFERENCES lines(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
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

-- Insert stops (without gtfs_id - that belongs to lines)
INSERT INTO stops (slug, name, display_ascii) 
VALUES 
    ('vysocanska', 'Vysočanská', 'Vysocanska'),
    ('albertov', 'Albertov', 'Albertov'),
    ('kolbenova', 'Kolbenova', 'Kolbenova')
ON CONFLICT (slug) DO NOTHING;

-- Insert lines with correct PID data
-- Metro B: pid_id 992, gtfs_id U75Z101P
-- Bus 136: pid_id from stops.json, gtfs_id U474Z6P
-- Bus 152: gtfs_id U474Z5P
-- Tram 12: gtfs_id U474Z2P
INSERT INTO lines (pid_id, gtfs_id, name, display_ascii, type, direction)
VALUES
    (123, 'U474Z6P', '136', '136', 'bus', 'Sídliště Čakovice'),
    (124, 'U474Z1P', '177', '177', 'bus', 'Chodov'),
    (992, 'U75Z101P', 'B', 'B', 'metro', 'Zličín'),
    (125, 'U474Z2P', '12', '12', 'tram', 'Lehovec'),
    (126, 'U474Z5P', '152', '152', 'bus', 'Českomoravská')
ON CONFLICT (pid_id, gtfs_id) DO NOTHING;

-- Link stops to lines (based on actual PID data)
INSERT INTO stops_lines (stop_id, line_id)
VALUES
    -- Vysocanska has bus 136, tram 12, bus 152
    ((SELECT id FROM stops WHERE slug = 'vysocanska'), (SELECT id FROM lines WHERE gtfs_id = 'U474Z6P')),
    ((SELECT id FROM stops WHERE slug = 'vysocanska'), (SELECT id FROM lines WHERE gtfs_id = 'U474Z2P')),
    ((SELECT id FROM stops WHERE slug = 'vysocanska'), (SELECT id FROM lines WHERE gtfs_id = 'U474Z5P')),
    -- Kolbenova has metro B
    ((SELECT id FROM stops WHERE slug = 'kolbenova'), (SELECT id FROM lines WHERE gtfs_id = 'U75Z101P')),
    -- Albertov has bus 177
    ((SELECT id FROM stops WHERE slug = 'albertov'), (SELECT id FROM lines WHERE gtfs_id = 'U474Z1P'))
ON CONFLICT DO NOTHING;

-- Create mock towers with stop_slug and line_name
INSERT INTO towers (id, gateway_id, name, stop_slug, line_name, battery_voltage, last_seen) 
VALUES
    ('547c65321d0b', 'c1895bf80e2b', 'Mock Tower 1', 'vysocanska', '136', 85.5, NOW()),
    ('547c65321d0c', 'c1895bf80e2b', 'Mock Tower 2', 'kolbenova', 'B', 92.3, NOW())
ON CONFLICT (id) DO NOTHING;