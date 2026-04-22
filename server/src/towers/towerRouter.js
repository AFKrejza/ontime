import express from "express";
import authMiddleware from "../auth/authMiddleware.js";
import { towerController } from "./towerController.js";
import { assignmentController } from "../assignments/assignmentController.js";

export const towerRouter = express.Router();

towerRouter.get("/:towerId", authMiddleware, towerController.findById);

towerRouter.post("/:towerId/addAssignment", authMiddleware, assignmentController.addAssignment);

// deletes a tower's assignments
towerRouter.delete("/:towerId/assignments/deleteAll", authMiddleware, assignmentController.deleteAllByTowerId);

towerRouter.delete("/:towerId/assignments/:assignmentId", authMiddleware, assignmentController.deleteAssignment);