import express from "express";
import authMiddleware from "../auth/authMiddleware.js";
import { gatewayController } from "./gatewayController.js";

export const gatewayRouter = express.Router();

// user registers it to their account
gatewayRouter.post("/register", authMiddleware, gatewayController.register);

// gateway checks if it's registered
// We don't need this! Use the logic in assigntowers
gatewayRouter.post("/check", gatewayController.check);

// gateway assigns towers to itself
gatewayRouter.post("/assigntowers", gatewayController.assignTowers);

gatewayRouter.post("/departures", gatewayController.getDepartures);

gatewayRouter.get("/:gatewayId/status", authMiddleware, gatewayController.status);

gatewayRouter.patch("/:gatewayId/rename", authMiddleware, gatewayController.rename);

gatewayRouter.delete("/:gatewayId", authMiddleware, gatewayController.delete);