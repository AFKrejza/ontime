import express from "express";
import {authController} from "./authController.js";
import authMiddleware from "./authMiddleware.js";

const authRouter = express.Router();

// userName, email, password
authRouter.post("/signup", authController.signup);

// email, password
authRouter.post("/login", authController.login);

// authRouter.post("/google", authController.googleAuth);

export {
	authRouter
};
