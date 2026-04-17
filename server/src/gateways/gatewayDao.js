import { pgClient } from "../db/postgres.js";

export const gatewayDao = {

	async register({ userId, gatewayId, gatewayName }) {
		return await pgClient.query(`
			INSERT INTO gateways (user_id, id, name)
			VALUES ($1, $2, $3)
			RETURNING id, user_id AS "userId", name, created_at AS "createdAt"
		`, [userId, gatewayId, gatewayName]);
	},

	async check(id) {
		return await pgClient.query(`
			SELECT * FROM gateways WHERE id = $1
		`, [id]);
	},

	async assignTower(gatewayId, towerId) {
		return await pgClient.query(`
			INSERT INTO towers (id, name, gateway_id)
			VALUES ($1, $1, $2)
			RETURNING id, gateway_id as gatewayId, name, created_at as createdAt
		`, [towerId, gatewayId]);
	},
};
