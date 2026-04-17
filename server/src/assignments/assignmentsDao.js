import { pgClient } from "../db/postgres.js";

export const assignmentsDao = {

	async getTowerAssignments(towerId) {
		return await pgClient.query(`
			SELECT
				a.id AS assignment_id
				a.tower_id,
				a.departure_offset,
				a.stop_id,
				a.line_id,
				s.slug AS stop_slug,
				s.name AS stop_name,
				s,display_ascii AS stop_display_ascii,
				l.pid_id,
				l.gtfs_id,
				l.name AS line_name,
				l.display_ascii AS line_display_ascii,
				l.type AS line_type,
				l.direction AS line_direction
			FROM assignments a
			JOIN stops s ON s.id = a.stop_id
			JOIN lines l ON l.id = a.line_id
			WHERE a.tower_id = $1
		`, [towerId]);
	},
	
	async getGatewayAssignments(gatewayId) {
		return await pgClient.query(`
			SELECT
				a.tower_id,
				a.departure_offset,
				a.stop_id,
				a.line_id,
				s.slug AS stop_slug,
				s.name as stop_name,
				s.display_ascii AS stop_display_ascii,
				l.pid_id,
				l.gtfs_id,
				l.name AS line_name,
				l.display_ascii AS line_display_ascii,
				l.type AS line_type,
				l.direction AS line_direction
			FROM assignments a
			JOIN stops s ON s.id = a.stop_id
			JOIN lines l ON l.id = a.line_id
			JOIN towers t ON t.id = a.tower_id
			WHERE t.gateway_id = $1
		`, [gatewayId]);
	},
	
};
