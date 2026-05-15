import { towerService } from "./towerService.js";
import { assignmentService } from "../assignments/assignmentService.js";

// TODO: try/catch + throw proper errors

export const towerController = {

	async findById(req, res) {
		try {
			const userId = req.user.id;
			const towerId = req.params.towerId;
			const authorize = await towerService.authorize(userId, towerId);
	
			const result = await towerService.getInfo(towerId);
			res.status(200).json(result);

		} catch (err) {
			console.error(err);
			const statusCode = error.statusCode || 500;
			res.status(statusCode).json({ error: err.message });
		}
	},

	async deleteById(req, res) {
		try {
			const userId = req.user.id;
			const towerId = req.params.towerId;
			const authorize = await towerService.authorize(userId, towerId);
	
			const rowCount = await towerService.deleteById(towerId);
			if (rowCount == 0) {
				return res.status(404).json({ message: "Not found "});
			}
			return res.status(200).json({ deleteCount: rowCount });
		} catch (err) {
			console.error(err);
			const statusCode = error.statusCode || 500;
			res.status(statusCode).json({ error: err.message });
		}
	},

	async rename(req, res) {
		try {
			const userId = req.user.id;
			const towerId = req.params.towerId;
			const towerName = req.body.name;
			const authorize = await towerService.authorize(userId, towerId);
	
			const result = await towerService.rename(towerId, towerName);
			return res.status(200).json(result);
		} catch (err) {
			console.error(err);
			const statusCode = error.statusCode || 500;
			res.status(statusCode).json({ error: err.message });
		}
	}

};
