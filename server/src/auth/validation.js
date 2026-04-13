import Ajv from "ajv";
import ajvErrors from "ajv-errors";
// import { createUserSchema, updateUserSchema, createGoogleUserSchema } from "./schemas/userSchemas.js"
// import { createProjectSchema, updateProjectSchema } from "./schemas/projectSchemas.js"
// import { createPaymentSchema } from "./schemas/paymentSchemas.js";
// import { createPostSchema, updatePostSchema } from "./schemas/postSchemas.js";

const ajv = new Ajv({allErrors: true});
ajvErrors(ajv);

const validateCreateUser = ajv.compile(createUserSchema);
const validateCreateGoogleUser = ajv.compile(createGoogleUserSchema);
const validateUpdateUser = ajv.compile(updateUserSchema);

const validateCreateProject = ajv.compile(createProjectSchema);
const validateUpdateProject = ajv.compile(updateProjectSchema);

const validateCreatePayment = ajv.compile(createPaymentSchema);

const validateCreatePost = ajv.compile(createPostSchema);
const validateUpdatePost = ajv.compile(updatePostSchema);

export {
	validateCreateUser,
	validateCreateGoogleUser,
	validateUpdateUser,
	validateCreateProject,
	validateUpdateProject,
	validateCreatePayment,
	validateCreatePost,
	validateUpdatePost
}