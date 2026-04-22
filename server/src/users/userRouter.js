import { userController } from "./userController.js";
import express from "express";
import authMiddleware from "../auth/authMiddleware.js";

export const userRouter = express.Router();

userRouter.get("/profile", authMiddleware, userController.getProfile);