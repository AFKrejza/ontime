import { pgClient } from "../db/postgres.js";

export const gatewayDao = {

	async register({ userId, gatewayId, gatewayName }) {
		return await pgClient.query(`
			INSERT INTO gateways (user_id, id, name)
			VALUES ($1, $2, $3)
			RETURNING id, user_id AS "userId", name, created_at AS "createdAt"
		`, [userId, gatewayId, gatewayName]);
	},

	async findById(gatewayId) {
		return await pgClient.query(`
			SELECT * FROM gateways WHERE id = $1
		`, [gatewayId]);
	},

	async rename(gatewayId, gatewayName) {
		return await pgClient.query(`
			UPDATE gateways
			SET name = $1
			WHERE id = $2
			RETURNING id, name
		`, [gatewayName, gatewayId]);
	},

	async list(userId) {
		return await pgClient.query(`
			SELECT * FROM gateways WHERE user_id = $1
		`, [userId]);
	},

	async deleteById(gatewayId) {
		return await pgClient.query(`
			DELETE FROM gateways WHERE id = $1
		`, [gatewayId]);
	},

	async getSecret(gatewayId) {
		return await pgClient.query(`
			SELECT hmac_secret FROM gateways WHERE id = $1
		`, [gatewayId]);
	},

	async generateSecret(gatewayId, secret) {
		return await pgClient.query(`
			UPDATE gateways
			SET hmac_secret = $2
			WHERE id = $1
			RETURNING *
		`, [gatewayId, secret]);
	}

};
