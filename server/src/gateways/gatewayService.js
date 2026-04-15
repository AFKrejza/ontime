import { gatewayDao } from "./gatewayDao.js";

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

	async getDepartures(gatewayId, towerIds) {
		// check if it's assigned to someone
		const res = await gatewayDao.check(gatewayId);
		if (!response.rows[0]) return false;

		// if tower exists, read its assignments
		// if not, create an entry and link to gateway
		// for (tower of towerIds) {
		// 	await 
		// }
		

	}
};
