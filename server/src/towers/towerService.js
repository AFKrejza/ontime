import { pgClient } from "../db/postgres.js"
import { towerDao } from "./towerDao.js";
import { gatewayDao } from "../gateways/gatewayDao.js";
import { assignmentDao } from "../assignments/assignmentDao.js";

export const towerService = {

	async getTowerAssignments(towerId) {
		const result = await assignmentDao.getByTowerId(towerId);
		if (result.rows.length === 0) return null;

		return {
			towerId,
			assignments: result.rows.map(row => ({
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
			}))
		};
	},
	
	async getInfo(towerId) {
		let tower = await towerDao.findById(towerId);
		tower = tower.rows[0];
		console.log(JSON.stringify(tower));
		const res = await this.getTowerAssignments(towerId);
		let assignments;
		if (res && res.assignments)
			assignments = res.assignments;
		else
			assignments = [];

		const result = {
			id: tower.id,
			name: tower.name,
			battery: tower.battery,
			lastSeen: tower.last_seen,
			assignments: assignments
		};

		return result;
	},

	async authorize(userId, towerId) {
		let tower = await towerDao.findById(towerId);
		if (!tower || !tower.rows[0]) {
			throw new Error("Not found");
		}
		tower = tower.rows[0];

		let gateway = await gatewayDao.findById(tower.gateway_id);
		if (!gateway) {
			throw new Error("Not found");
		}
		gateway = gateway.rows[0];

		if (gateway.user_id !== userId) {
			throw new Error("Unauthorized");
		}
		return true;
	},

	async deleteById(towerId) {
		const result = await towerDao.deleteById(towerId);
		return result.rowCount;
	},

	async rename(towerId, towerName) {
		const result = await towerDao.rename(towerId, towerName);
		return result.rows[0];
	},

	async updateHealth(towerId, batteryCharge) {
		batteryCharge = Number(batteryCharge);
		const result = await towerDao.updateHealth(towerId, batteryCharge);

		// if (result.rowCount == 0) {
		// 	throw new Error(`Error updating tower ${towerId} health data`); // TODO: add the actual error message + try/catch
		// }

		return result.rowCount;
	}
	
};
