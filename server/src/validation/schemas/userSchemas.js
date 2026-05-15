import { definitions } from "./commonDefinitions.js";

// PATCH /users/update
// Controller reads: req.body.{ username, email }
// Both fields are optional on update — but if provided, they must be valid,
// and at least one must be present (otherwise the request is a no-op).
export const userUpdateSchema = {
	$id: "userUpdate",
	type: "object",
	properties: {
		username: definitions.username,
		email: definitions.email
	},
	additionalProperties: false,
	anyOf: [
		{ required: ["username"] },
		{ required: ["email"] }
	],
	errorMessage: {
		type: "request body must be a JSON object",
		additionalProperties: "unknown field is not allowed",
		anyOf: "at least one of username or email must be provided"
	}
};