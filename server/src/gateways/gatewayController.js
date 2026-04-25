import { fetchDepartures } from "../pid/fetchDepartures.js";
import { gatewayService } from "./gatewayService.js";

// TODO: add try/catch with error handling

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

	async getDepartures(req, res) {
		const gatewayId = req.body.gatewayId;
		const towerIds = req.body.towerIds;

		// check if assigned
		const result = await gatewayService.check(gatewayId);
		if (!result) {
			res.status(404).json({ registered: false });
			return;
		}

		// assign towers
		const newTowers = await gatewayService.addTowers(gatewayId, towerIds);
		console.log(`gateway ${gatewayId} has ${towerIds.length} towers, ${towerIds.length - newTowers.length} new towers assigned`);

		const assignments = await gatewayService.getGatewayAssignments(gatewayId);

		const departures = await fetchDepartures(assignments);

		console.log(departures);
		res.setHeader('Content-Type', 'text/plain');
		res.status(200).send(departures);
	},

	async status(req, res) {
		const userId = req.user.id;
		const gatewayId = req.params.gatewayId;

		console.log(gatewayId);

		const authorized = await gatewayService.authorize(userId, gatewayId);
		const gateway = await gatewayService.check(gatewayId);
		const result = await gatewayService.getGatewayAssignments(gatewayId);
		const status = {
			gatewayId: gatewayId,
			gatewayName: gateway.name,
			towers: result
		}
		res.status(200).send(status);
	},

	async rename(req, res) {
		const userId = req.user.id;
		const gatewayId = req.params.gatewayId;
		const gatewayName = req.body.name;

		const authorized = await gatewayService.authorize(userId, gatewayId);
		const result = await gatewayService.rename(gatewayId, gatewayName);
		console.log(result);
		return res.status(201).json(result);
	},

	async list(req, res) {
		const userId = req.user.id;		
		const gateways = await gatewayService.list(userId);
		if (!gateways) {
			return res.status(404).json({ message: "not found" });
		}
		return res.status(200).json(gateways);
	},

	async delete(req, res) {
		const userId = req.user.id;
		const gatewayId = req.params.gatewayId;
		const authorized = await gatewayService.authorize(userId, gatewayId);

		const rowCount = await gatewayService.delete(gatewayId);
		if (rowCount == 0) {
			return res.status(404).json({ message: "Not found" });
		}
		return res.status(200).json({ deleteCount: rowCount });
	}
};
