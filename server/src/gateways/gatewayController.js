import { gatewayService } from "./gatewayService.js";

// add try/catch with error handling

export const gatewayController = {
	async register(req, res) {
		const data = {
			userId: Number(req.user.id),
			gatewayId: String(req.body.gatewayId),
			gatewayName: String(req.body.gatewayName),
		};
		const newGateway = await gatewayService.register(data);
		res.status(201).json(newGateway);
	},

	async check(req, res) {
		const id = req.body.data.gatewayId;
		const result = await gatewayService.check(id);
		if (!result) {
			res.status(404).json({ registered: false });
			return;
		}
		result.registered = true;
		res.status(200).json(result);
	},

	async assignTowers(req, res) {
		const gatewayId = req.body.gatewayId;
		const towerIds = req.body.towerIds;
		const result = await gatewayService.assignTowers(gatewayId, towerIds);
		res.status(201).json(`${result} towers assigned to ${gatewayId}`);
	},

	// ~~NEXT~~
	async getDepartures(req, res) {
		const gatewayId = req.body.data.gatewayId;
		const towerIds = req.body.data.towerIds;
		const result = await gatewayService.getDepartures(gatewayId, towerIds);
	}
};
