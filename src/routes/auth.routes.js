import express from 'express';
import { login, logout, register } from '#controllers/auth.controller.js';
import schemaValidatorMiddleware from '#middleware/schemaValidator.middleware.js';
import { loginSchema, registerSchema, addMemberSchema } from '#validations/auth.validator.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import roleBaseAccessControlMiddleware from '#middleware/roleBasedAccessControl.middleware.js';

const router = express.Router();

router.post('/login', schemaValidatorMiddleware(loginSchema), login);

router.post('/register', schemaValidatorMiddleware(registerSchema), register);

router.use(authenticationMiddleware);

router.post('/logout', logout);

router.post('/member',
    roleBaseAccessControlMiddleware(["moderator"]),
    schemaValidatorMiddleware(addMemberSchema), 
    register
);

export default router;
