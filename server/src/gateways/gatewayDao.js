import { pgClient } from "../db/postgres.js";

export const gatewayDao = {
	async register({ userId, gatewayId, gatewayName }) {
		return await pgClient.query(`
			INSERT INTO gateways (user_id, id, name)
			VALUES ($1, $2, $3)
			RETURNING id, user_id AS "userId", name, created_at AS "createdAt"
		`, [userId, gatewayId, gatewayName]);
	}
};
