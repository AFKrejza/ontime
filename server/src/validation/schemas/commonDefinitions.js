// Shared, reusable schema fragments. Imported by every domain schema file.
// Keeping these in one place makes it trivial to tighten rules globally
// (e.g. bumping min password length) without hunting through every schema.

// 12 lowercase hex chars, e.g. "c1895bf80e2b". Matches the IDs your gateways/towers use.
export const HEX_ID_PATTERN = "^[0-9a-f]{12}$";

// Letters, numbers, underscore, hyphen.
export const USERNAME_PATTERN = "^[A-Za-z0-9_-]+$";

export const definitions = {
	hexId: {
		type: "string",
		pattern: HEX_ID_PATTERN,
		errorMessage: {
			type: "must be a string",
			pattern: "must be exactly 12 lowercase hexadecimal characters (e.g. 'c1895bf80e2b')"
		}
	},

	email: {
		type: "string",
		format: "email",
		maxLength: 255,
		minLength: 1,
		errorMessage: {
			type: "email must be a string",
			format: "email must be a valid email address",
			maxLength: "email must be at most 255 characters",
			minLength: "email is required"
		}
	},

	password: {
		type: "string",
		minLength: 8,
		maxLength: 128,
		errorMessage: {
			type: "password must be a string",
			minLength: "password must be at least 8 characters",
			maxLength: "password must be at most 128 characters"
		}
	},

	username: {
		type: "string",
		minLength: 3,
		maxLength: 50,
		pattern: USERNAME_PATTERN,
		errorMessage: {
			type: "username must be a string",
			minLength: "username must be at least 3 characters",
			maxLength: "username must be at most 50 characters",
			pattern: "username may only contain letters, numbers, underscores and hyphens"
		}
	},

	// Display name for gateways/towers — looser than username, just non-empty + bounded.
	displayName: {
		type: "string",
		minLength: 1,
		maxLength: 100,
		// Disallow strings that are only whitespace.
		pattern: "\\S",
		errorMessage: {
			type: "name must be a string",
			minLength: "name must not be empty",
			maxLength: "name must be at most 100 characters",
			pattern: "name must not be only whitespace"
		}
	},

	batteryCharge: {
		type: "number",
		minimum: 0,
		maximum: 100,
		errorMessage: {
			type: "charge must be a number",
			minimum: "charge must be at least 0",
			maximum: "charge must be at most 100"
		}
	},

	// Matches the DB CHECK constraint: departure_offset <= 0
	departureOffset: {
		type: "integer",
		maximum: 0,
		errorMessage: {
			type: "departureOffset must be an integer",
			maximum: "departureOffset must be 0 or negative"
		}
	},

	positiveInt: {
		type: "integer",
		minimum: 1,
		errorMessage: {
			type: "must be an integer",
			minimum: "must be a positive integer (>= 1)"
		}
	}
};