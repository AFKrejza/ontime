import { pgClient } from "../db/postgres.js";

export const pidDao = {
  /**
   * Get all stops for autocomplete
   * @returns {Promise<Array<{slug: string, name: string, display_ascii: string}>>}
   */
  async getAllStops() {
    const query = `
      SELECT slug, name, display_ascii
      FROM stops
      ORDER BY name
    `;
    const res = await pgClient.query(query);
    return res.rows;
  },

  /**
   * Get detailed stop information including its lines
   * @param {string} slug - The stop slug (e.g., "vysocanska")
   * @returns {Promise<{slug: string, name: string, lines: object}>}
   */
  async getStopDetails(slug) {
    // Get stop info
    const stopQuery = `
      SELECT slug, name, display_ascii
      FROM stops
      WHERE slug = $1
    `;
    const stopRes = await pgClient.query(stopQuery, [slug]);
    
    if (stopRes.rows.length === 0) {
      throw new Error(`Stop ${slug} not found`);
    }
    
    const stop = stopRes.rows[0];
    
    // Get lines for this stop using stops_lines junction table
    const linesQuery = `
      SELECT 
        l.name,
        l.type,
        l.direction,
        l.gtfs_id as "gtfsId"
      FROM stops_lines sl
      JOIN lines l ON sl.line_id = l.id
      WHERE sl.stop_id = (SELECT id FROM stops WHERE slug = $1)
      ORDER BY l.type, l.name
    `;
    
    const linesRes = await pgClient.query(linesQuery, [slug]);
    
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
        gtfsId: line.gtfsId
      });
    }
    
    return {
      slug: stop.slug,
      name: stop.name,
      lines
    };
  },

  /**
   * Fetch departures from PID API for a specific stop and line
   * @param {string} stopGtfsId - GTFS ID of the stop
   * @param {string} lineName - Line number (e.g., "136", "B")
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
   * @returns {Promise<{tower_id: string, stop_slug: string, line_name: string, stop_gtfs_id: string}>}
   */
  async getTowerConfig(towerId) {
    const query = `
      SELECT 
        t.id as tower_id,
        t.stop_slug,
        t.line_name,
        s.gtfs_id as stop_gtfs_id
      FROM towers t
      LEFT JOIN stops s ON t.stop_slug = s.slug
      WHERE t.id = $1
    `;
    const res = await pgClient.query(query, [towerId]);
    
    if (res.rows.length === 0) {
      throw new Error(`Tower ${towerId} not found`);
    }
    
    return res.rows[0];
  },

  /**
   * Get gateway configuration by gateway ID
   * @param {string} gatewayId - The gateway ID
   * @returns {Promise<{gateway_id: string, user_id: number, towers: Array}>}
   */
  async getGatewayConfig(gatewayId) {
    // Get gateway info
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
        t.stop_slug,
        t.line_name,
        s.gtfs_id as stop_gtfs_id,
        s.name as stop_name
      FROM towers t
      LEFT JOIN stops s ON t.stop_slug = s.slug
      WHERE t.gateway_id = $1
    `;
    const towersRes = await pgClient.query(towersQuery, [gatewayId]);
    
    return {
      gateway_id: gateway.gateway_id,
      user_id: gateway.user_id,
      name: gateway.name,
      towers: towersRes.rows
    };
  }
};