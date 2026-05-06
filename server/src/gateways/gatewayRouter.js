import express from "express";
import authMiddleware from "../auth/authMiddleware.js";
import { gatewayController } from "./gatewayController.js";
import { validate } from "../validation.js";

export const gatewayRouter = express.Router();

// user registers it to their account
gatewayRouter.post(
	"/register",
	authMiddleware,
	validate("gatewayRegister"),
	gatewayController.register
);

// gateway checks if it's registered
// We don't need this! Use the logic in assigntowers
// NOTE: controller reads req.body.data.gatewayId, so we validate body.data.
gatewayRouter.post(
	"/check",
	validate("gatewayCheck", "body.data"),
	gatewayController.check
);

// gateway assigns towers to itself
gatewayRouter.post(
	"/assigntowers",
	validate("gatewayAssignTowers"),
	gatewayController.assignTowers
);

gatewayRouter.post(
	"/departures",
	validate("gatewayDepartures"),
	gatewayController.getDepartures
);

gatewayRouter.get(
	"/:gatewayId/status",
	authMiddleware,
	validate("gatewayIdParam", "params"),
	gatewayController.status
);

gatewayRouter.patch(
	"/:gatewayId/rename",
	authMiddleware,
	validate("gatewayIdParam", "params"),
	validate("gatewayRename"),
	gatewayController.rename
);

gatewayRouter.delete(
	"/:gatewayId",
	authMiddleware,
	validate("gatewayIdParam", "params"),
	gatewayController.delete
);

gatewayRouter.post(
	"/health",
	validate("gatewayHealth"),
	gatewayController.updateHealth
);
