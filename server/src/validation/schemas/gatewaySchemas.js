import { definitions } from "./commonDefinitions.js";

// POST /gateways/register — body: { gatewayId, gatewayName }
export const gatewayRegisterSchema = {
	$id: "gatewayRegister",
	type: "object",
	properties: {
		gatewayId: definitions.hexId,
		gatewayName: definitions.displayName
	},
	required: ["gatewayId", "gatewayName"],
	additionalProperties: false,
	errorMessage: {
		type: "request body must be a JSON object",
		required: {
			gatewayId: "gatewayId is required",
			gatewayName: "gatewayName is required"
		},
		additionalProperties: "unknown field is not allowed"
	}
};

// POST /gateways/check — controller reads req.body.data.gatewayId
// We point the validator at req.body.data so the schema describes that nested object.
export const gatewayCheckSchema = {
	$id: "gatewayCheck",
	type: "object",
	properties: {
		gatewayId: definitions.hexId
	},
	required: ["gatewayId"],
	additionalProperties: false,
	errorMessage: {
		type: "request body.data must be a JSON object",
		required: { gatewayId: "gatewayId is required" },
		additionalProperties: "unknown field is not allowed"
	}
};

// POST /gateways/assigntowers — body: { gatewayId, towerIds: [hexId, ...] }
export const gatewayAssignTowersSchema = {
	$id: "gatewayAssignTowers",
	type: "object",
	properties: {
		gatewayId: definitions.hexId,
		towerIds: {
			type: "array",
			items: definitions.hexId,
			minItems: 1,
			uniqueItems: true,
			errorMessage: {
				type: "towerIds must be an array",
				minItems: "towerIds must contain at least one tower id",
				uniqueItems: "towerIds must not contain duplicates"
			}
		}
	},
	required: ["gatewayId", "towerIds"],
	additionalProperties: false,
	errorMessage: {
		type: "request body must be a JSON object",
		required: {
			gatewayId: "gatewayId is required",
			towerIds: "towerIds is required"
		},
		additionalProperties: "unknown field is not allowed"
	}
};

// POST /gateways/departures — same shape as assigntowers
export const gatewayDeparturesSchema = {
	$id: "gatewayDepartures",
	type: "object",
	properties: {
		gatewayId: definitions.hexId,
		towerIds: {
			type: "array",
			items: definitions.hexId,
			minItems: 1,
			uniqueItems: true,
			errorMessage: {
				type: "towerIds must be an array",
				minItems: "towerIds must contain at least one tower id",
				uniqueItems: "towerIds must not contain duplicates"
			}
		}
	},
	required: ["gatewayId", "towerIds"],
	additionalProperties: false,
	errorMessage: {
		type: "request body must be a JSON object",
		required: {
			gatewayId: "gatewayId is required",
			towerIds: "towerIds is required"
		},
		additionalProperties: "unknown field is not allowed"
	}
};

// PATCH /gateways/:gatewayId/rename — body: { name }
export const gatewayRenameSchema = {
	$id: "gatewayRename",
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

// POST /gateways/health — body: { gatewayId, towerId, charge }
export const gatewayHealthSchema = {
	$id: "gatewayHealth",
	type: "object",
	properties: {
		gatewayId: definitions.hexId,
		towerId: definitions.hexId,
		charge: definitions.batteryCharge
	},
	required: ["gatewayId", "towerId", "charge"],
	additionalProperties: false,
	errorMessage: {
		type: "request body must be a JSON object",
		required: {
			gatewayId: "gatewayId is required",
			towerId: "towerId is required",
			charge: "charge is required"
		},
		additionalProperties: "unknown field is not allowed"
	}
};

// Used to validate :gatewayId route param
export const gatewayIdParamSchema = {
	$id: "gatewayIdParam",
	type: "object",
	properties: { gatewayId: definitions.hexId },
	required: ["gatewayId"],
	errorMessage: {
		required: { gatewayId: "gatewayId path parameter is required" }
	}
};