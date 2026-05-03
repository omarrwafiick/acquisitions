import responseHandler from "#utils/response.js";
import validationHandler from "#utils/validation.js";
import { registerSchema } from "#validations/auth.validator.js";
import { createUser } from '#services/auth.service.js';
import { jwtToken } from "#utils/security.js";
import { cookies } from '#utils/cookies.js';

export const register = (req, res, next) => {
    try {
        const { name, email, password } = validationHandler(registerSchema, req.body);

        const newUser = await createUser({ name, email, password });

        const token = await jwtToken.sign(newUser);

        cookies.set(res, 'token', token);

        responseHandler(req, res, { message: 'success account creation', data: { newUser } }, 201);
    } catch (error) {
        responseHandler(req, res, error, error.status||400);
    }
};