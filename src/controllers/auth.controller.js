import responseHandler from "#utils/response.js";
import validationHandler from "#utils/validation.js";
import { registerSchema } from "#validations/auth.validator.js";

export const register = (req, res, next) => {
    try {
        const data = validationHandler(registerSchema, req.body);

        // logic

        responseHandler(req, res, 'Success account creation', 201);
    } catch (error) {
        responseHandler(req, res, error, error.status||400);
    }
};