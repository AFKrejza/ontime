import fs from 'fs';
import { pgClient } from '../db/postgres.js';

export async function packStopsLines() {
    try {
        // Check if data already exists
        // const check = await pgClient.query("SELECT id FROM stops LIMIT 1");
        // if (check.rows.length > 0) {
        //     console.log("Data already exists in DB. Skipping import.");
        //     return;
        // }
        const trieData = JSON.parse(fs.readFileSync('./data/trieData.json', 'utf8'));
        const stopsDetails = JSON.parse(fs.readFileSync( './data/stopDetails.json', 'utf8'));

        const stopIdMap = new Map();

        await pgClient.query('BEGIN');

        // FILLING STOPS TABLE
        console.log("Filling stops...");
        for (const stop of trieData) {
            const res = await pgClient.query(`
                INSERT INTO stops (slug, name, display_ascii)
                VALUES ($1, $2, $3)
                ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
                RETURNING id
            `, [stop.id, stop.name, stop.id]);
            
            stopIdMap.set(stop.id, res.rows[0].id);
        }

        // Filling LINES AND STOPS_LINES
        console.log("Filling lines and relations...");
        for (const stopDetail of stopsDetails) {
            const dbStopId = stopIdMap.get(stopDetail.id);
            if (!dbStopId) continue;

            const allLines = stopDetail.lines || {};
            for (const type in allLines) {
                for (const line of allLines[type]) {
                    const resLine = await pgClient.query(`
                        INSERT INTO lines (pid_id, gtfs_id, name, display_ascii, type, direction)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        ON CONFLICT (pid_id, gtfs_id) DO UPDATE SET name = EXCLUDED.name
                        RETURNING id
                    `, [line.id, line.gtfsId, line.name, line.name, type, line.direction]);

                    const dbLineId = resLine.rows[0].id;

                    await pgClient.query(`
                        INSERT INTO stops_lines (stop_id, line_id)
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [dbStopId, dbLineId]);
                }
            }
        }

        await pgClient.query('COMMIT');
        await addMockData();
        console.log('Success! Data packed!!!');

    } catch (err) {
        await pgClient.query('ROLLBACK');
        console.error("ERROR in packDb:", err.message);
    }
}

async function addMockData() {
    try {
        // Add mock user
        await pgClient.query(`
            INSERT INTO users (username, password_hash, email)
            VALUES ($1, $2, $3)
            ON CONFLICT (username) DO NOTHING
        `, ['mock_user', 'admin123', 'mock@example.com']);

        const userRes = await pgClient.query("SELECT id FROM users WHERE username = $1", ['mock_user']);
        const userId = userRes.rows[0].id;

        // 2. Add Gateway (ID: c1895bf80e2b)
        await pgClient.query(`
            INSERT INTO gateways (user_id, name)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
        `, [userId, 'Gateway c1895bf80e2b']);

        const gwRes = await pgClient.query("SELECT id FROM gateways WHERE name = $1", ['Gateway c1895bf80e2b']);
        const gatewayId = gwRes.rows[0].id;

        // 3. Add Tower (ID: 547c65321d0b)
        await pgClient.query(`
            INSERT INTO towers (gateway_id, name)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
        `, [gatewayId, 'Tower 547c65321d0b']);

    } catch (err) {
        console.error("Error adding mock data:", err.message);
    }
}