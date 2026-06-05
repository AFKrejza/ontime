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
	gatewayController.updateHealth
);

gatewayRouter.get(
	"/:gatewayId/secret",
	authMiddleware,
	gatewayController.getSecret
);

gatewayRouter.post(
	"/:gatewayId/generateSecret",
	authMiddleware,
	gatewayController.generateSecret
);
