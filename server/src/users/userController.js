import { userService } from "./userService.js";

export const userController = {
	async getProfile(req, res) {
		try {
			const userId = req.user.id;
	
			const result = await userService.getProfile(userId);
			if (!result) {
				return res.status(404).json({ msg: "User not found" });
			}
			return res.status(200).json(result);
		} catch (err) {
			console.error(err);
			const statusCode = error.statusCode || 500;
			res.status(statusCode).json({ error: err.message });
		}

	},

	async update(req, res) {
		try {
			const userId = req.user.id;
			const { username, email } = req.body;
			const data = { username, email };
			const result = await userService.update(userId, data);
			return res.status(200).json(result);
		} catch (err) {
			console.error(err);
			const statusCode = error.statusCode || 500;
			res.status(statusCode).json({ error: err.message });
		}
	}
};