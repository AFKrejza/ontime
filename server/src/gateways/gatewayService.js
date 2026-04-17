import { gatewayDao } from "./gatewayDao.js";
import { towerDao } from "../towers/towerDao.js";
import { assignmentsDao } from "../assignments/assignmentsDao.js";

// TODO: verify input + sanitize, throw errors

export const gatewayService = {
	async register(data) {
		const response = await gatewayDao.register(data);
		return response.rows[0];
	},

	async check(id) {
		const response = await gatewayDao.check(id);
		if (!response.rows[0]) return null;
		return response.rows[0];
	},

	async assignTowers(gatewayId, towerIds) {
		let count = 0;
		for (id in towerIds) {
			await gatewayDao.assignTower(gatewayId, id);
			count++;
		}
		return count;
	},

	// assign towers to a gateway
	async addTowers(gatewayId, towerIds) {
		const newTowers = [];

		// if towers aren't registered, create an entry and link to gateway
		for (const towerId of towerIds) {
			const res = await towerDao.findById(towerId);
			if (!res.rows[0]) {
				await towerDao.register(towerId, gatewayId);
				newTowers.push(towerId);
			}
		}
		return newTowers;
	},

	async getGatewayAssignments(gatewayId) {
		const result = await assignmentsDao.getGatewayAssignments(gatewayId);

		const towersMap = new Map();
		for (const row of result.rows) {
			if (!towersMap.has(row.tower_id)) {
				towersMap.set(row.tower_id, { towerId: row.tower_id, assignments: [] });
			}
			towersMap.get(row.tower_id).assignments.push({
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
			});
		}

		return Array.from(towersMap.values());
	}
};
