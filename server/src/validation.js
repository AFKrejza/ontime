import Ajv from "ajv";
import addFormats from "ajv-formats";
import ajvErrors from "ajv-errors";

import { signupSchema, loginSchema } from "./validation/schemas/authSchemas.js";
import {
    gatewayRegisterSchema,
    gatewayCheckSchema,
    gatewayAssignTowersSchema,
    gatewayDeparturesSchema,
    gatewayRenameSchema,
    gatewayHealthSchema,
    gatewayIdParamSchema
} from "./validation/schemas/gatewaySchemas.js";
import {
    towerAddAssignmentSchema,
    towerRenameSchema,
    towerIdParamSchema,
    assignmentIdParamSchema
} from "./validation/schemas/towerSchemas.js";
import { userUpdateSchema } from "./validation/schemas/userSchemas.js";

const ajv = new Ajv({
    allErrors: true,
    $data: true,
    strict: false
});

addFormats(ajv);
ajvErrors(ajv);

const compiled = {
    signup:               ajv.compile(signupSchema),
    login:                ajv.compile(loginSchema),
    gatewayRegister:      ajv.compile(gatewayRegisterSchema),
    gatewayCheck:         ajv.compile(gatewayCheckSchema),
    gatewayAssignTowers:  ajv.compile(gatewayAssignTowersSchema),
    gatewayDepartures:    ajv.compile(gatewayDeparturesSchema),
    gatewayRename:        ajv.compile(gatewayRenameSchema),
    gatewayHealth:        ajv.compile(gatewayHealthSchema),
    gatewayIdParam:       ajv.compile(gatewayIdParamSchema),
    towerAddAssignment:   ajv.compile(towerAddAssignmentSchema),
    towerRename:          ajv.compile(towerRenameSchema),
    towerIdParam:         ajv.compile(towerIdParamSchema),
    assignmentIdParam:    ajv.compile(assignmentIdParamSchema),
    userUpdate:           ajv.compile(userUpdateSchema)
};

function resolveSource(req, source) {
    switch (source) {
        case "body":             return req.body;
        case "params":           return req.params;
        case "body.data":        return req.body && req.body.data;
        case "body.assignment":  return req.body && req.body.assignment;
        default:                 return req.body;
    }
}

function formatErrors(errors) {
    if (!errors) return [];
    return errors.map((err) => {
        const path = err.instancePath || (err.params && err.params.missingProperty ? "/" + err.params.missingProperty : "");
        const where = path ? path.replace(/^\//, "").replace(/\//g, ".") : "(root)";
        return {
            field: where,
            message: err.message,
            keyword: err.keyword
        };
    });
}

export function validate(schemaName, source = "body") {
    const validator = compiled[schemaName];
    if (!validator) {
        throw new Error('validate(): unknown schema "' + schemaName + '"');
    }

    return function validationMiddleware(req, res, next) {
        const data = resolveSource(req, source);

        if (data === undefined || data === null) {
            return res.status(400).json({
                errors: [{
                    field: source,
                    message: "expected " + source + " to be present",
                    keyword: "required"
                }]
            });
        }

        const ok = validator(data);
        if (ok) return next();

        return res.status(400).json({
            errors: formatErrors(validator.errors)
        });
    };
}

export const validators = compiled;
export { ajv };
