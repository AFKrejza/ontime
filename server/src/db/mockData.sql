-- mock data

INSERT INTO users (username, password_hash, email)
VALUES ('admin', '$2b$10$nLUaNLzX3qiX2XSkEZ92Uug8HaEjhcODk6EQT1qzwLdCd12N694BW', 'admin@gmail.com')
ON CONFLICT (username) DO NOTHING;

WITH u AS (
	SELECT id FROM users WHERE username = 'admin'
)
INSERT INTO gateways (id, user_id, name)
SELECT 'c1895bf80e2b', id, 'Mock Gateway' FROM u
ON CONFLICT (id) DO NOTHING;

INSERT INTO towers (id, gateway_id, name)
VALUES ('547c65321d0b', 'c1895bf80e2b', 'Desk')
ON CONFLICT (id) DO NOTHING;

INSERT INTO assignments (tower_id, stop_id, line_id, departure_offset)
SELECT '547c65321d0b', 1393, 11563, -15
WHERE NOT EXISTS (
	SELECT 1 FROM assignments WHERE tower_id = '547c65321d0b'
);
