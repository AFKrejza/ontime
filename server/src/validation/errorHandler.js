// Centralized error handler for validation-related errors.
//
// The validate() middleware in validation.js already responds 400 directly,
// so this handler is for two cases:
//   1) JSON parse errors thrown by express.json() before validation even runs.
//   2) Errors that are explicitly forwarded with `next(err)` and tagged as
//      validation errors (err.isValidation === true or err.name === "ValidationError").
//
// Mount it AFTER all routers in app.js:
//   import { validationErrorHandler } from "./src/validation/errorHandler.js";
//   ...
//   app.use(validationErrorHandler);

export function validationErrorHandler(err, req, res, next) {
	// Body-parser / express.json() malformed JSON
	if (err && err.type === "entity.parse.failed") {
		return res.status(400).json({
			errors: [{
				field: "(root)",
				message: "request body is not valid JSON",
				keyword: "parse"
			}]
		});
	}

	// Errors forwarded as validation errors
	if (err && (err.isValidation || err.name === "ValidationError")) {
		const errors = Array.isArray(err.errors) && err.errors.length
			? err.errors
			: [{ field: err.field || "(root)", message: err.message, keyword: "validation" }];
		return res.status(400).json({ errors });
	}

	// Not ours — let the next handler deal with it.
	return next(err);
}