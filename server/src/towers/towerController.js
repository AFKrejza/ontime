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
			console.log(err);
			res.status(500).json({ message: "Error" });
		}
	},

	async addAssignment(req, res) {
		const userId = req.user.id;
		const towerId = req.params.towerId;
		const { departureOffset, lineId, stopId } = req.body.assignment;
		const newAssignment = {
			departureOffset,
			lineId,
			stopId
		};
		const authorize = await towerService.authorize(userId, towerId);

		const result = await assignmentService.create(towerId, newAssignment);
		res.status(201).json(result);
	},

	async deleteAllByTowerId(req, res) {
		const userId = req.user.id;
		const towerId = req.params.towerId;
		const authorize = await towerService.authorize(userId, towerId);

		const result = await assignmentService.deleteAllByTowerId(towerId);
		res.status(200).json({ deleteCount: result });
	}

};
