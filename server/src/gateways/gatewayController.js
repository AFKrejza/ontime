import { fetchDepartures } from "../pid/fetchDepartures.js";
import { gatewayService } from "./gatewayService.js";
import { towerService } from "../towers/towerService.js";

export const gatewayController = {
	async register(req, res) {
		try {
			const data = {
				userId: Number(req.user.id),
				gatewayId: String(req.body.gatewayId),
				gatewayName: String(req.body.gatewayName),
			};
			const newGateway = await gatewayService.register(data);
			res.status(201).json(newGateway);
		} catch (err) {
			console.error(err);
			const statusCode = error.statusCode || 500;
			res.status(statusCode).json({ error: err.message });
		}
	},

	async check(req, res) {
		try {
			const id = req.body.data.gatewayId;
			const result = await gatewayService.check(id);
			if (!result) {
				res.status(404).json({ registered: false });
				return;
			}
			result.registered = true;
			res.status(200).json(result);
		} catch (err) {
			console.error(err);
			const statusCode = error.statusCode || 500;
			res.status(statusCode).json({ error: err.message });
		}
	},

	async assignTowers(req, res) {
		try {
			const gatewayId = req.body.gatewayId;
			const towerIds = req.body.towerIds;
			const result = await gatewayService.assignTowers(gatewayId, towerIds);
			res.status(201).json(`${result} towers assigned to ${gatewayId}`);
		} catch (err) {
			console.error(err);
			const statusCode = error.statusCode || 500;
			res.status(statusCode).json({ error: err.message });
		}
	},

	async getDepartures(req, res) {
		try {
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
		} catch (err) {
			console.error(err);
			const statusCode = error.statusCode || 500;
			res.status(statusCode).json({ error: err.message });
		}
	},

	async status(req, res) {
		try {
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
		} catch (err) {
			console.error(err);
			const statusCode = error.statusCode || 500;
			res.status(statusCode).json({ error: err.message });
		}
	},

	async rename(req, res) {
		try {
			const userId = req.user.id;
			const gatewayId = req.params.gatewayId;
			const gatewayName = req.body.name;
	
			const authorized = await gatewayService.authorize(userId, gatewayId);
			const result = await gatewayService.rename(gatewayId, gatewayName);
			console.log(result);
			return res.status(201).json(result);
		} catch (err) {
			console.error(err);
			const statusCode = error.statusCode || 500;
			res.status(statusCode).json({ error: err.message });
		}
	},

	async list(req, res) {
		try {
			const userId = req.user.id;		
			const gateways = await gatewayService.list(userId);
			if (!gateways) {
				return res.status(404).json({ message: "not found" });
			}
			return res.status(200).json(gateways);
		} catch (err) {
			console.error(err);
			const statusCode = error.statusCode || 500;
			res.status(statusCode).json({ error: err.message });
		}
	},

	async delete(req, res) {
		try {
			const userId = req.user.id;
			const gatewayId = req.params.gatewayId;
			const authorized = await gatewayService.authorize(userId, gatewayId);
	
			const rowCount = await gatewayService.delete(gatewayId);
			if (rowCount == 0) {
				return res.status(404).json({ message: "Not found" });
			}
			return res.status(200).json({ deleteCount: rowCount });
		} catch (err) {
			console.error(err);
			const statusCode = error.statusCode || 500;
			res.status(statusCode).json({ error: err.message });
		}
	},

	// TODO: needs some kind of auth
	async updateHealth(req, res) {
		try {
			const gatewayId = req.body.gatewayId;
			const batteryCharge = req.body.charge;
			const towerId = req.body.towerId;
	
			const result = await towerService.updateHealth(towerId, batteryCharge);
			if (!result) {
				console.log(`failed to update battery for tower ${towerId}`);
				return res.status(404).json({ message: "Failed to update" });
			}
			console.log(`Updated battery for tower ${towerId}`);
			return res.status(200).json({ message: result });
		} catch (err) {
			console.error(err);
			const statusCode = error.statusCode || 500;
			res.status(statusCode).json({ error: err.message });
		}
	}
};
