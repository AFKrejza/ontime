import { pgClient } from "../db/postgres.js";

// Mock data for when database is not available
const mockStops = [
  { id: "vysocanska", name: "Vysocanska", display_ascii: "Vysocanska" },
  { id: "jizni-mesto", name: "Jizni Mesto", display_ascii: "Jizni Mesto" },
  { id: "mustek", name: "Mustek", display_ascii: "Mustek" },
  { id: "florenc", name: "Florenc", display_ascii: "Florenc" },
  { id: "hlavni-nadrazi", name: "Hlavni Nadrazi", display_ascii: "Hlavni Nadrazi" },
  { id: "andel", name: "Andel", display_ascii: "Andel" },
  { id: "dejvicka", name: "Dejvicka", display_ascii: "Dejvicka" },
  { id: "palmovka", name: "Palmovka", display_ascii: "Palmovka" },
];

const mockStopDetails = {
  "vysocanska": {
    id: "vysocanska",
    name: "Vysocanska",
    lines: {
      "BUS": [
        { name: "136", type: "BUS", direction: "Jizni Mesto", gtfsId: "U474Z6P", pidId: 123 },
        { name: "183", type: "BUS", direction: "Haje", gtfsId: "U123Z5P", pidId: 124 }
      ],
      "TRAM": [
        { name: "12", type: "TRAM", direction: "Sporka", gtfsId: "T123Z1P", pidId: 125 },
        { name: "17", type: "TRAM", direction: "Vozovna Kobylisy", gtfsId: "T123Z2P", pidId: 126 }
      ]
    }
  },
  "jizni-mesto": {
    id: "jizni-mesto",
    name: "Jizni Mesto",
    lines: {
      "BUS": [
        { name: "136", type: "BUS", direction: "Vysocanska", gtfsId: "U474Z6P", pidId: 123 },
        { name: "213", type: "BUS", direction: "Modrany", gtfsId: "U789Z1P", pidId: 127 }
      ]
    }
  },
  "mustek": {
    id: "mustek",
    name: "Mustek",
    lines: {
      "METRO": [
        { name: "A", type: "METRO", direction: "Dejvicka", gtfsId: "A123", pidId: 101 },
        { name: "B", type: "METRO", direction: "Zlicin", gtfsId: "B123", pidId: 102 }
      ]
    }
  }
};

let useMockData = false;

export const pidDao = {
  /**
   * Check if database is available
   */
  async checkDatabase() {
    try {
      await pgClient.query("SELECT 1");
      return true;
    } catch (err) {
      console.warn("Database not available, using mock data");
      useMockData = true;
      return false;
    }
  },

  /**
   * Get all stops for autocomplete (just id and name)
   * @returns {Promise<Array<{id: string, name: string}>>}
   */
  async getAllStops() {
    if (useMockData) {
      console.log("Using mock stops data");
      return mockStops;
    }

    try {
      const query = `
        SELECT slug as id, name, display_ascii
        FROM stops
        ORDER BY name
        LIMIT 100
      `;
      const res = await pgClient.query(query);
      
      if (res.rows.length === 0) {
        console.log("No stops found in database, using mock data");
        return mockStops;
      }
      
      return res.rows;
    } catch (err) {
      console.error("Error fetching stops from database:", err.message);
      console.log("Falling back to mock data");
      return mockStops;
    }
  },

  /**
   * Get detailed stop information including its lines
   * @param {string} stopSlug - The slug/id of the stop
   * @returns {Promise<{id: string, name: string, lines: object}>}
   */
  async getStopDetails(stopSlug) {
    if (useMockData) {
      console.log(`Using mock stop details for ${stopSlug}`);
      if (mockStopDetails[stopSlug]) {
        return mockStopDetails[stopSlug];
      }
      // Return generic mock data
      return {
        id: stopSlug,
        name: stopSlug.charAt(0).toUpperCase() + stopSlug.slice(1),
        lines: {
          "BUS": [
            { name: "136", type: "BUS", direction: "Direction 1", gtfsId: "U474Z6P", pidId: 123 }
          ]
        }
      };
    }

    try {
      // Get stop info
      const stopQuery = `
        SELECT slug as id, name, display_ascii
        FROM stops
        WHERE slug = $1
      `;
      const stopRes = await pgClient.query(stopQuery, [stopSlug]);
      
      if (stopRes.rows.length === 0) {
        throw new Error(`Stop ${stopSlug} not found`);
      }
      
      const stop = stopRes.rows[0];
      
      // Get stop database ID
      const stopIdQuery = `SELECT id FROM stops WHERE slug = $1`;
      const stopIdRes = await pgClient.query(stopIdQuery, [stopSlug]);
      
      if (stopIdRes.rows.length === 0) {
        return {
          id: stop.id,
          name: stop.name,
          lines: {}
        };
      }
      
      const stopDbId = stopIdRes.rows[0].id;
      
      // Get lines for this stop
      const linesQuery = `
        SELECT 
          l.name,
          l.type,
          l.direction,
          l.gtfs_id as "gtfsId",
          l.pid_id as "pidId"
        FROM stops_lines sl
        JOIN lines l ON sl.line_id = l.id
        WHERE sl.stop_id = $1
        ORDER BY l.type, l.name
      `;
      
      const linesRes = await pgClient.query(linesQuery, [stopDbId]);
      
      // Group lines by type
      const lines = {};
      for (const line of linesRes.rows) {
        if (!lines[line.type]) {
          lines[line.type] = [];
        }
        lines[line.type].push({
          name: line.name,
          type: line.type,
          direction: line.direction,
          gtfsId: line.gtfsId,
          pidId: line.pidId
        });
      }
      
      return {
        id: stop.id,
        name: stop.name,
        lines
      };
    } catch (err) {
      console.error("Error fetching stop details:", err.message);
      if (err.message.includes("not found")) {
        throw err;
      }
      // Fallback to mock data on error
      console.log("Falling back to mock data");
      return mockStopDetails[stopSlug] || {
        id: stopSlug,
        name: stopSlug,
        lines: {}
      };
    }
  },

  /**
   * Get departures for a specific stop and line from PID API
   * @param {string} stopGtfsId - The GTFS ID of the stop
   * @param {string} lineName - The line number (e.g., "136")
   * @param {number} minutesAfter - Minutes to look ahead (default 60)
   * @param {number} minutesBefore - Minutes to look back (default -10)
   * @returns {Promise<object>}
   */
  async fetchDeparturesFromPID(stopGtfsId, lineName, minutesAfter = 60, minutesBefore = -10) {
    const url = "https://api.golemio.cz/v2/public/departureboards?" + new URLSearchParams({
      stopIds: JSON.stringify({ "0": [stopGtfsId] }),
      limit: 5,
      routeShortNames: lineName,
      minutesAfter: minutesAfter,
      minutesBefore: minutesBefore,
    });
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Access-Token": process.env.API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`PID API returned ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  /**
   * Get tower configuration by tower ID
   * @param {string} towerId - The tower ID
   * @returns {Promise<{tower_id: string, gateway_id: string, stop_id: string, line_gtfs_id: string, stop_gtfs_id?: string}>}
   */
  async getTowerConfig(towerId) {
    if (useMockData) {
      console.log(`Using mock tower config for ${towerId}`);
      return {
        tower_id: towerId,
        gateway_id: process.env.GATEWAY_ID || "c1895bf80e2b",
        stop_id: "vysocanska",
        line_gtfs_id: "136",
        stop_gtfs_id: "U474Z6P"
      };
    }

    try {
      const query = `
        SELECT 
          t.id as tower_id,
          t.gateway_id,
          t.stop_id,
          t.line_gtfs_id,
          s.gtfs_id as stop_gtfs_id
        FROM towers t
        LEFT JOIN stops s ON t.stop_id = s.slug
        WHERE t.id = $1
      `;
      const res = await pgClient.query(query, [towerId]);
      
      if (res.rows.length === 0) {
        throw new Error(`Tower ${towerId} not found`);
      }
      
      return res.rows[0];
    } catch (err) {
      console.error("Error fetching tower config:", err.message);
      // Return mock config on error
      return {
        tower_id: towerId,
        gateway_id: process.env.GATEWAY_ID || "c1895bf80e2b",
        stop_id: "vysocanska",
        line_gtfs_id: "136",
        stop_gtfs_id: "U474Z6P"
      };
    }
  },

  /**
   * Get gateway configuration by gateway ID
   * @param {string} gatewayId - The gateway ID
   * @returns {Promise<{gateway_id: string, user_id: number, towers: Array}>}
   */
  async getGatewayConfig(gatewayId) {
    if (useMockData) {
      console.log(`Using mock gateway config for ${gatewayId}`);
      return {
        gateway_id: gatewayId,
        user_id: 1,
        name: "Mock Gateway",
        towers: [
          {
            tower_id: process.env.TOWER_ID || "547c65321d0b",
            tower_name: "Mock Tower",
            stop_id: "vysocanska",
            line_gtfs_id: "136",
            stop_gtfs_id: "U474Z6P",
            stop_name: "Vysocanska"
          }
        ]
      };
    }

    try {
      // First get gateway info
      const gatewayQuery = `
        SELECT id as gateway_id, user_id, name
        FROM gateways
        WHERE id = $1
      `;
      const gatewayRes = await pgClient.query(gatewayQuery, [gatewayId]);
      
      if (gatewayRes.rows.length === 0) {
        throw new Error(`Gateway ${gatewayId} not found`);
      }
      
      const gateway = gatewayRes.rows[0];
      
      // Get all towers for this gateway
      const towersQuery = `
        SELECT 
          t.id as tower_id,
          t.name as tower_name,
          t.stop_id,
          t.line_gtfs_id,
          s.gtfs_id as stop_gtfs_id,
          s.name as stop_name
        FROM towers t
        LEFT JOIN stops s ON t.stop_id = s.slug
        WHERE t.gateway_id = $1
      `;
      const towersRes = await pgClient.query(towersQuery, [gatewayId]);
      
      return {
        gateway_id: gateway.gateway_id,
        user_id: gateway.user_id,
        name: gateway.name,
        towers: towersRes.rows
      };
    } catch (err) {
      console.error("Error fetching gateway config:", err.message);
      // Return mock config on error
      return {
        gateway_id: gatewayId,
        user_id: 1,
        name: "Mock Gateway (Fallback)",
        towers: [
          {
            tower_id: process.env.TOWER_ID || "547c65321d0b",
            tower_name: "Mock Tower",
            stop_id: "vysocanska",
            line_gtfs_id: "136",
            stop_gtfs_id: "U474Z6P",
            stop_name: "Vysocanska"
          }
        ]
      };
    }
  },

  /**
   * Seed mock data for testing (run once)
   */
  async seedMockData() {
    if (useMockData) {
      console.log("Using mock data mode, skipping database seed");
      return;
    }

    try {
      // Check if mock user exists
      const userCheck = await pgClient.query(`SELECT id FROM users WHERE username = 'mock_user'`);
      
      let userId;
      if (userCheck.rows.length === 0) {
        // Create mock user
        const userRes = await pgClient.query(`
          INSERT INTO users (username, password_hash, email)
          VALUES ('mock_user', 'mock_hash', 'mock@example.com')
          RETURNING id
        `);
        userId = userRes.rows[0].id;
        console.log("Created mock user");
      } else {
        userId = userCheck.rows[0].id;
      }
      
      // Check if mock gateway exists
      const gatewayCheck = await pgClient.query(`SELECT id FROM gateways WHERE id = $1`, [process.env.GATEWAY_ID]);
      
      if (gatewayCheck.rows.length === 0) {
        // Create mock gateway
        await pgClient.query(`
          INSERT INTO gateways (id, user_id, name)
          VALUES ($1, $2, 'Mock Gateway')
        `, [process.env.GATEWAY_ID, userId]);
        console.log(`Created mock gateway: ${process.env.GATEWAY_ID}`);
      }
      
      // Check if mock tower exists
      const towerCheck = await pgClient.query(`SELECT id FROM towers WHERE id = $1`, [process.env.TOWER_ID]);
      
      if (towerCheck.rows.length === 0) {
        // Create mock tower
        await pgClient.query(`
          INSERT INTO towers (id, gateway_id, name, stop_id, line_gtfs_id)
          VALUES ($1, $2, 'Mock Tower', 'vysocanska', '136')
        `, [process.env.TOWER_ID, process.env.GATEWAY_ID]);
        console.log(`Created mock tower: ${process.env.TOWER_ID}`);
      }
      
      console.log("Mock data seeded successfully");
    } catch (err) {
      console.error("Error seeding mock data:", err.message);
    }
  }
};