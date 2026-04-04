/*
	Reference docs/db-schema.md
	
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
	stop_id TEXT,
	line_gtfs_id TEXT,
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
	gtfs_id TEXT,
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

CREATE TABLE IF NOT EXISTS assignments (
	id SERIAL PRIMARY KEY,
	tower_id TEXT NOT NULL,
	stop_id INTEGER NOT NULL,
	line_id INTEGER NOT NULL,
	departure_offset INTEGER NOT NULL,
	CONSTRAINT departure_offset_nonpositive CHECK (departure_offset <= 0),
	FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE CASCADE,
	FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE,
	FOREIGN KEY (line_id) REFERENCES lines(id) ON DELETE CASCADE,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON lines FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON stops FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================== MOCK DATA FOR TESTING ====================

-- Clean up existing mock data (for fresh runs)
DO $$ 
BEGIN
    -- Delete existing mock data if any
    DELETE FROM assignments WHERE tower_id IN ('547c65321d0b', '547c65321d0c');
    DELETE FROM towers WHERE id IN ('547c65321d0b', '547c65321d0c');
    DELETE FROM stops_lines WHERE stop_id IN (SELECT id FROM stops WHERE slug IN ('vysocanska', 'albertov', 'kolbenova'));
    DELETE FROM lines WHERE gtfs_id IN ('U474Z6P', 'U474Z1P', 'U75Z101P', 'U474Z2P', 'U474Z5P');
    DELETE FROM stops WHERE slug IN ('vysocanska', 'albertov', 'kolbenova');
    DELETE FROM gateways WHERE id = 'c1895bf80e2b';
    DELETE FROM users WHERE username = 'mock_user';
END $$;

-- Create mock user
INSERT INTO users (username, password_hash, email) 
VALUES ('mock_user', 'hashed_password', 'mock@example.com')
ON CONFLICT (username) DO NOTHING;

-- Create mock gateway for c1895bf80e2b
INSERT INTO gateways (id, user_id, name) 
VALUES ('c1895bf80e2b', (SELECT id FROM users WHERE username = 'mock_user'), 'Mock Gateway')
ON CONFLICT (id) DO NOTHING;

-- Create mock stops
INSERT INTO stops (slug, name, display_ascii, gtfs_id) 
VALUES 
	('vysocanska', 'Vysočanská', 'Vysocanska', 'U474Z6P'),
	('albertov', 'Albertov', 'Albertov', 'U474Z1P'),
	('kolbenova', 'Kolbenova', 'Kolbenova', 'U75Z101P')
ON CONFLICT (slug) DO NOTHING;

-- Create mock lines
INSERT INTO lines (pid_id, gtfs_id, name, display_ascii, type, direction)
VALUES
	(1, 'U474Z6P', '136', '136', 'bus', 'Sídliště Čakovice'),
	(2, 'U474Z1P', '177', '177', 'bus', 'Chodov'),
	(3, 'U75Z101P', 'B', 'B', 'metro', 'Zličín'),
	(4, 'U474Z2P', '12', '12', 'tram', 'Lehovec'),
	(5, 'U474Z5P', '152', '152', 'bus', 'Českomoravská')
ON CONFLICT (pid_id, gtfs_id) DO NOTHING;

-- Link stops and lines
INSERT INTO stops_lines (stop_id, line_id)
VALUES
	((SELECT id FROM stops WHERE slug = 'vysocanska'), (SELECT id FROM lines WHERE gtfs_id = 'U474Z6P')),
	((SELECT id FROM stops WHERE slug = 'vysocanska'), (SELECT id FROM lines WHERE gtfs_id = 'U474Z2P')),
	((SELECT id FROM stops WHERE slug = 'vysocanska'), (SELECT id FROM lines WHERE gtfs_id = 'U474Z5P')),
	((SELECT id FROM stops WHERE slug = 'kolbenova'), (SELECT id FROM lines WHERE gtfs_id = 'U75Z101P')),
	((SELECT id FROM stops WHERE slug = 'albertov'), (SELECT id FROM lines WHERE gtfs_id = 'U474Z1P'))
ON CONFLICT DO NOTHING;

-- Create mock towers (with stop_id and line_gtfs_id for direct configuration)
INSERT INTO towers (id, gateway_id, name, stop_id, line_gtfs_id, battery_voltage, last_seen) 
VALUES
	('547c65321d0b', 'c1895bf80e2b', 'Mock Tower 1', 'vysocanska', '136', 85.5, NOW()),
	('547c65321d0c', 'c1895bf80e2b', 'Mock Tower 2', 'kolbenova', 'B', 92.3, NOW())
ON CONFLICT (id) DO NOTHING;

-- Create mock assignments (tower -> stop -> line with departure offset)
INSERT INTO assignments (tower_id, stop_id, line_id, departure_offset)
VALUES
	('547c65321d0b', (SELECT id FROM stops WHERE slug = 'vysocanska'), (SELECT id FROM lines WHERE gtfs_id = 'U474Z6P'), -10),
	('547c65321d0c', (SELECT id FROM stops WHERE slug = 'kolbenova'), (SELECT id FROM lines WHERE gtfs_id = 'U75Z101P'), -15)
ON CONFLICT DO NOTHING;

-- Verify the data was inserted
DO $$
DECLARE
    user_count INTEGER;
    gateway_count INTEGER;
    tower_count INTEGER;
    stop_count INTEGER;
    line_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users WHERE username = 'mock_user';
    SELECT COUNT(*) INTO gateway_count FROM gateways WHERE id = 'c1895bf80e2b';
    SELECT COUNT(*) INTO tower_count FROM towers WHERE id IN ('547c65321d0b', '547c65321d0c');
    SELECT COUNT(*) INTO stop_count FROM stops WHERE slug IN ('vysocanska', 'albertov', 'kolbenova');
    SELECT COUNT(*) INTO line_count FROM lines WHERE gtfs_id IN ('U474Z6P', 'U474Z1P', 'U75Z101P', 'U474Z2P', 'U474Z5P');
    
    RAISE NOTICE 'Mock data verification:';
    RAISE NOTICE '  Users: %', user_count;
    RAISE NOTICE '  Gateways: %', gateway_count;
    RAISE NOTICE '  Towers: %', tower_count;
    RAISE NOTICE '  Stops: %', stop_count;
    RAISE NOTICE '  Lines: %', line_count;
END $$;