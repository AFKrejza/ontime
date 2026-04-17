import { assignmentsDao } from "./assignmentsDao.js";

export const assignmentsService = {

	async getTowerAssignments(towerId) {
		const result = await assignmentsDao.getTowerAssignments(towerId);
		if (result.rows.length === 0) return null;

		return {
			towerId,
			assignments: result.rows.map(row => ({
				departureOffset: row.departure_offset,
				stopId: row.stop_id,
				lineId: row.line_id,
				gtfsId: row.gtfs_id,
				stop: {
					id: row.stop_id,
					slug: row.stop_slug,
					name: row.stop_name,
					displayAscii: row.stop_display_ascii
				},
				line: {
					id: row.line_id,
					pidId: row.pid_id,
					gtfsId: row.gtfs_id,
					name: row.line_name,
					displayAscii: row.line_display_ascii,
					type: row.line_type,
					direction: row.line_direction
				}
			}))
		};
	}
};
