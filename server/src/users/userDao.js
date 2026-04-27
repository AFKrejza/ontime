import { pgClient } from "../db/postgres.js"

export const userDao = {

	async findById(id) {
		return await pgClient.query(`
			SELECT * FROM users WHERE id = $1
		`, [id]);
	},
	
	async findByEmail(email) {
		return await pgClient.query(`
			SELECT * FROM users WHERE email = $1
		`, [email]);
	},

	async create(user) {
		return await pgClient.query(`
			INSERT INTO users (email, username, password_hash)
			VALUES ($1, $2, $3)
			RETURNING (id, email, username, created_at)
		`, [user.email, user.userName, user.passwordHash]);
	},

	async getProfile(id) {
		return await pgClient.query(`
			SELECT id, email, username, created_at FROM users WHERE id = $1
		`, [id]);
	},

	async update(userId, data) {
		return await pgClient.query(`
			UPDATE users
			SET email = COALESCE($2, email),
				username = COALESCE($3, username)
			WHERE id = $1
			RETURNING id, email, username, created_at, updated_at
		`, [userId, data.email, data.username]);
	}
}
