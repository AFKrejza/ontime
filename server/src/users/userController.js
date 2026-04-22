import { userService } from "./userService.js";

export const userController = {
	async getProfile(req, res) {
		const userId = req.user.id;

		const result = await userService.getProfile(userId);
		if (!result) {
			return res.status(404).json({ msg: "User not found" });
		}

		return res.status(200).json(result);
	}
};