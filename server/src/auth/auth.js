import express from "express";
import { authController } from "./authController.js";
import authMiddleware from "./authMiddleware.js";
import { validate } from "../validation.js";

export const authRouter = express.Router();

// Public routes — validate body before hitting the controller.
authRouter.post("/signup", validate("signup"), authController.signup);
authRouter.post("/login",  validate("login"),  authController.login);

// Protected route — JWT auth runs first, sets req.user, then the controller reads it.
// No body validation needed here since /profile takes no input.
authRouter.get("/profile", authMiddleware, authController.profile);
