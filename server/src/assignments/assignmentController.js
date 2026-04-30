import { assignmentService } from "./assignmentService.js";
import { towerService } from "../towers/towerService.js";

export const assignmentController = {

	async addAssignment(req, res) {
		const userId = req.user.id;
		const towerId = req.params.towerId;
		const { departureOffset, lineId, stopId } = req.body.assignment;
		const newAssignment = {
			departureOffset,
			lineId
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
	},

	async deleteAssignment(req, res) {
		const userId = req.user.id;
		const towerId = req.params.towerId;
		const assignmentId = req.params.assignmentId;
		const authorize = await towerService.authorize(userId, towerId);

		const result = await assignmentService.deleteById(assignmentId);
		if (result.deleteCount == 0) {
			res.status(404).json({ message: "Not found" });
		} else {
			res.status(200).json({ deleteCount: result });
		}
	}
}