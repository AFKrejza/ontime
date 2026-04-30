import { gatewayDao } from "./gatewayDao.js";
import { towerDao } from "../towers/towerDao.js";
import { assignmentDao } from "../assignments/assignmentDao.js";

// TODO: verify input + sanitize, throw errors

export const gatewayService = {
	async register(data) {
		const response = await gatewayDao.register(data);
		return response.rows[0];
	},

	async check(id) {
		const response = await gatewayDao.findById(id);
		if (!response.rows[0]) return null;
		return response.rows[0];
	},

	async assignTowers(gatewayId, towerIds) {
		let count = 0;
		for (id in towerIds) {
			await towerDao.assignTower(gatewayId, id);
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
		const towers = await towerDao.getByGatewayId(gatewayId);
		const result = await assignmentDao.getByGatewayId(gatewayId);

		const towersMap = new Map();
		for (const row of towers.rows) {
			towersMap.set(row.id, { towerId: row.id, towerName: row.name, battery: row.battery, lastSeen: row.last_seen, assignments: [] });
		}
		for (const row of result.rows) {
			towersMap.get(row.tower_id).assignments.push({
				assignmentId: row.assignment_id,
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
	},

	async rename(gatewayId, gatewayName) {
		const result = await gatewayDao.rename(gatewayId, gatewayName);
		return result.rows[0];
	},

	async list(userId) {
		const result = await gatewayDao.list(userId);
		return result.rows;
	},

	async authorize(userId, gatewayId) {
		let gateway = await gatewayDao.findById(gatewayId);
		if (!gateway) {
			throw new Error("Not found");
		}
		gateway = gateway.rows[0];

		if (gateway.user_id !== userId) {
			throw new Error("Unauthorized");
		}
		return true;
	},

	async delete(gatewayId) {
		const res = await gatewayDao.deleteById(gatewayId);
		return res.rowCount;
	}
};
