-- mock data

INSERT INTO users (username, password_hash, email)
VALUES ('admin', '$2b$10$D48HJvP/kEKtgGwUI.mR8Oee9U9KsYN9PGL6xPq5D0RlZrex6MRpm', 'admin@gmail.com')
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
SELECT 
    '547c65321d0b',
    s.id,
    l.id,
    -15
FROM stops s
JOIN stops_lines sl ON sl.stop_id = s.id
JOIN lines l ON l.id = sl.line_id
WHERE 
    s.slug = 'vysocanska'
    AND l.display_ascii = 'Sidliste Cakovice'
	AND NOT EXISTS (select 1 FROM assignments a WHERE a.tower_id = '547c65321d0b')
LIMIT 1
ON CONFLICT DO NOTHING;