import express from "express";
import { authController } from "./authController.js";
import authMiddleware from "./authMiddleware.js";
import { validate } from "../validation.js";

export const authRouter = express.Router();

// Public routes — validate body before hitting the controller.
authRouter.post("/signup", validate("signup"), authController.signup);
authRouter.post("/login",  validate("login"),  authController.login);
