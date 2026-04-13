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
	}
};
