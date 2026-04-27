import { pgClient } from "../db/postgres.js";

export const assignmentDao = {

	async getByTowerId(towerId) {
		return await pgClient.query(`
			SELECT
				a.id AS assignment_id,
				a.tower_id,
				a.departure_offset,
				a.stop_id,
				a.line_id,
				s.slug AS stop_slug,
				s.name AS stop_name,
				s.display_ascii AS stop_display_ascii,
				l.pid_id,
				l.gtfs_id,
				l.name AS line_name,
				l.display_ascii AS line_display_ascii,
				l.type AS line_type,
				l.direction AS line_direction,
				t.name AS tower_name,
				t.battery_voltage AS battery,
				t.last_seen
			FROM assignments a
			JOIN stops s ON s.id = a.stop_id
			JOIN lines l ON l.id = a.line_id
			JOIN towers t ON t.id = a.tower_id
			WHERE a.tower_id = $1
		`, [towerId]);
	},
	
	async getByGatewayId(gatewayId) {
		return await pgClient.query(`
			SELECT
				a.id AS assignment_id,
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
				l.direction AS line_direction,
				t.name AS tower_name,
				t.battery_voltage AS battery,
				t.last_seen
			FROM assignments a
			JOIN stops s ON s.id = a.stop_id
			JOIN lines l ON l.id = a.line_id
			JOIN towers t ON t.id = a.tower_id
			WHERE t.gateway_id = $1
		`, [gatewayId]);
	},

	async create(towerId, newAssignment) {
		return await pgClient.query(`
			INSERT INTO assignments (tower_id, line_id, stop_id, departure_offset)
			VALUES ($1, $2, $3, $4)
			RETURNING *
		`, [towerId, newAssignment.lineId, newAssignment.stopId, newAssignment.departureOffset]);
	},

	async deleteAllByTowerId(towerId) {
		return await pgClient.query(`
			DELETE FROM assignments WHERE tower_id = $1
		`, [towerId]);
	},

	async deleteById(assignmentId) {
		return await pgClient.query(`
			DELETE FROM assignments WHERE id = $1
		`, [assignmentId]);
	}
	
};
