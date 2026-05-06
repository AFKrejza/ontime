import express from "express";
import authMiddleware from "../auth/authMiddleware.js";
import { towerController } from "./towerController.js";
import { assignmentController } from "../assignments/assignmentController.js";
import { validate } from "../validation.js";

export const towerRouter = express.Router();

towerRouter.get(
	"/:towerId",
	authMiddleware,
	validate("towerIdParam", "params"),
	towerController.findById
);

// Controller reads req.body.assignment.{ departureOffset, lineId, stopId }
towerRouter.post(
	"/:towerId/addAssignment",
	authMiddleware,
	validate("towerIdParam", "params"),
	validate("towerAddAssignment", "body.assignment"),
	assignmentController.addAssignment
);

// deletes a tower's assignments
towerRouter.delete(
	"/:towerId/assignments/deleteAll",
	authMiddleware,
	validate("towerIdParam", "params"),
	assignmentController.deleteAllByTowerId
);

towerRouter.delete(
	"/:towerId/assignments/:assignmentId",
	authMiddleware,
	validate("assignmentIdParam", "params"),
	assignmentController.deleteAssignment
);

towerRouter.delete(
	"/:towerId",
	authMiddleware,
	validate("towerIdParam", "params"),
	towerController.deleteById
);

towerRouter.patch(
	"/:towerId",
	authMiddleware,
	validate("towerIdParam", "params"),
	validate("towerRename"),
	towerController.rename
);
