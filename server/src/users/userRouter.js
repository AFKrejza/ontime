import { userController } from "./userController.js";
import express from "express";
import authMiddleware from "../auth/authMiddleware.js";
import { gatewayController } from "../gateways/gatewayController.js";

export const userRouter = express.Router();

userRouter.get("/profile", authMiddleware, userController.getProfile);

userRouter.get("/:userId/gateways/list", authMiddleware, gatewayController.list);

userRouter.patch("/update", authMiddleware, userController.update);