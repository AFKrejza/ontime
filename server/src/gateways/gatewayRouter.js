import express from "express";
import authMiddleware from "../auth/authMiddleware.js";
import { gatewayController } from "./gatewayController.js";

export const gatewayRouter = express.Router();

gatewayRouter.post("/register", authMiddleware, gatewayController.register);