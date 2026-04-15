import { pgClient } from "../db/postgres";

export const towerDao = {

	async get(id) {
		return await pgClient.query(`
			SELECT * FROM towers WHERE id = $1
		`, [id]);
	}
};