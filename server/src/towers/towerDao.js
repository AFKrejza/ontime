import { pgClient } from "../db/postgres.js";

export const towerDao = {

	async findById(id) {
		return await pgClient.query(`
			SELECT * FROM towers WHERE id = $1
		`, [id]);
	},

	async register(towerId, gatewayId) {
		return await pgClient.query(`
			INSERT INTO towers (id, gateway_id, name)
			VALUES ($1, $2, $1)
			RETURNING *
		`, [towerId, gatewayId]);
	},

	async assignTower(gatewayId, towerId) {
		return await pgClient.query(`
			INSERT INTO towers (id, name, gateway_id)
			VALUES ($1, $1, $2)
			RETURNING id, gateway_id as gatewayId, name, created_at as createdAt
		`, [towerId, gatewayId]);
	},

};
