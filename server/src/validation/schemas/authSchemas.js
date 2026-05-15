import { definitions } from "./commonDefinitions.js";

export const signupSchema = {
	$id: "signup",
	type: "object",
	properties: {
		userName: definitions.username,
		email: definitions.email,
		password: definitions.password
	},
	required: ["userName", "email", "password"],
	additionalProperties: false,
	errorMessage: {
		type: "request body must be a JSON object",
		required: {
			userName: "userName is required",
			email: "email is required",
			password: "password is required"
		},
		additionalProperties: "unknown field is not allowed"
	}
};

export const loginSchema = {
	$id: "login",
	type: "object",
	properties: {
		// Login intentionally does NOT enforce password complexity — we just need
		// it to be a non-empty string. Complexity is a signup concern.
		email: definitions.email,
		password: {
			type: "string",
			minLength: 1,
			errorMessage: {
				type: "password must be a string",
				minLength: "password is required"
			}
		}
	},
	required: ["email", "password"],
	additionalProperties: false,
	errorMessage: {
		type: "request body must be a JSON object",
		required: {
			email: "email is required",
			password: "password is required"
		},
		additionalProperties: "unknown field is not allowed"
	}
};