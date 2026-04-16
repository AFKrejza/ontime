import { pgClient } from "../db/postgres.js";

export const sampleDao = {
	
	async getStop(stopId) {
		const query = `
			SELECT * FROM stops WHERE id=$1
		`;
		const params = [stopId];
		const res = await pgClient.query(query, params);
		return res.rows[0];
	}
};