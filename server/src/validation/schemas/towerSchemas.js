import { definitions } from "./commonDefinitions.js";

// POST /towers/:towerId/addAssignment
// Controller reads: req.body.assignment.{ departureOffset, lineId, stopId }
// We point the validator at req.body.assignment.
export const towerAddAssignmentSchema = {
	$id: "towerAddAssignment",
	type: "object",
	properties: {
		departureOffset: definitions.departureOffset,
		lineId: definitions.positiveInt,
		stopId: definitions.positiveInt
	},
	required: ["departureOffset", "lineId", "stopId"],
	additionalProperties: false,
	errorMessage: {
		type: "assignment must be a JSON object",
		required: {
			departureOffset: "assignment.departureOffset is required",
			lineId: "assignment.lineId is required",
			stopId: "assignment.stopId is required"
		},
		additionalProperties: "unknown field in assignment is not allowed",
		properties: {
			lineId: "assignment.lineId must be a positive integer",
			stopId: "assignment.stopId must be a positive integer"
		}
	}
};

// PATCH /towers/:towerId — body: { name }
export const towerRenameSchema = {
	$id: "towerRename",
	type: "object",
	properties: {
		name: definitions.displayName
	},
	required: ["name"],
	additionalProperties: false,
	errorMessage: {
		type: "request body must be a JSON object",
		required: { name: "name is required" },
		additionalProperties: "unknown field is not allowed"
	}
};

// Used to validate :towerId route param
export const towerIdParamSchema = {
	$id: "towerIdParam",
	type: "object",
	properties: { towerId: definitions.hexId },
	required: ["towerId"],
	errorMessage: {
		required: { towerId: "towerId path parameter is required" }
	}
};

// Used to validate :towerId + :assignmentId path params on assignment delete
export const assignmentIdParamSchema = {
	$id: "assignmentIdParam",
	type: "object",
	properties: {
		towerId: definitions.hexId,
		assignmentId: {
			// Path params arrive as strings — coerce to integer for validation.
			type: "string",
			pattern: "^[1-9]\\d*$",
			errorMessage: {
				type: "assignmentId path parameter must be a string",
				pattern: "assignmentId must be a positive integer"
			}
		}
	},
	required: ["towerId", "assignmentId"],
	errorMessage: {
		required: {
			towerId: "towerId path parameter is required",
			assignmentId: "assignmentId path parameter is required"
		}
	}
};