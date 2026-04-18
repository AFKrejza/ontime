import express from "express";
import authMiddleware from "../auth/authMiddleware.js";
import { towerController } from "./towerController.js";

export const towerRouter = express.Router();

towerRouter.get("/:towerId", authMiddleware, towerController.findById);

towerRouter.post("/:towerId/addAssignment", authMiddleware, towerController.addAssignment);

// deletes a tower's assignments
towerRouter.delete("/:towerId/assignments/deleteAll", authMiddleware, towerController.deleteAllByTowerId);