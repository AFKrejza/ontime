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

	async deleteById(towerId) {
		return await pgClient.query(`
			DELETE FROM towers WHERE id = $1
		`, [towerId]);
	},

	async getByGatewayId(gatewayId) {
		return await pgClient.query(`
			SELECT * FROM towers WHERE gateway_id = $1
		`, [gatewayId]);
	},

	async rename(towerId, towerName) {
		return await pgClient.query(`
			UPDATE towers
			SET name = $2
			WHERE id = $1
			RETURNING *
		`, [towerId, towerName]);
	},

	async updateHealth(towerId, batteryCharge) {
		return await pgClient.query(`
			UPDATE towers 
			SET battery = $2, 
			last_seen = NOW() 
			WHERE id = $1
		`, [towerId, batteryCharge]);
	}

};
