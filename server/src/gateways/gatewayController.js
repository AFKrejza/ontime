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

		const gateway = await gatewayService.check(gatewayId);
		if (!gateway) {
			res.status(404).json({ registered: false });
			return;
		}
		if (gateway.user_id !== userId) {
			res.status(403).json({ message: "Forbidden" });
			return;
		}

		const towers = await gatewayService.getGatewayAssignments(gatewayId);

		const result = {
			gatewayId: gatewayId,
			gatewayName: gateway.name,
			towers: towers
		}


		res.status(200).send(result);
	}
};
