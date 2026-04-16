/*
	Reference docs/db-schema.md

	This still needs to be integrated properly!!!  

	TODO: add indexes
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


CREATE TABLE IF NOT EXISTS assignments (
	id SERIAL PRIMARY KEY,
	tower_id TEXT NOT NULL,
	stop_id INTEGER NOT NULL,
	line_id INTEGER NOT NULL,
	departure_offset INTEGER NOT NULL,
	CONSTRAINT departure_offset_nonpositive CHECK (departure_offset <= 0),
	FOREIGN KEY (tower_id) REFERENCES towers(id),
	FOREIGN KEY (stop_id) REFERENCES stops(id),
	FOREIGN KEY (line_id) REFERENCES lines(id),
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- this isn't necessary, just add the stop_id to each line
CREATE TABLE IF NOT EXISTS stops_lines (
	stop_id INTEGER NOT NULL,
	line_id INTEGER NOT NULL,
	PRIMARY KEY (stop_id, line_id),
	FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE,
	FOREIGN KEY (line_id) REFERENCES lines(id) ON DELETE CASCADE,
	created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON gateways FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON towers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON lines FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON stops FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX ON stops (slug);
CREATE INDEX ON stops_lines (stop_id);
CREATE INDEX ON stops_lines (line_id);

/*
	TODO: Add some mock data
*/
