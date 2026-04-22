import { pgClient } from "../db/postgres.js"
import { userDao } from "./userDao.js";

export const userService = {
	async getProfile(userId) {
		const result = await userDao.getProfile(userId);

		if (!result.rows[0]) {
			return false;
		}

		const data = result.rows[0];
		const profile = {
			username: data.username,
			email: data.email,
			createdAt: data.created_at,
			id: data.id
		}
		console.log(data);
		return profile;
	}
};
