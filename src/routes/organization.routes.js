import express from 'express';
import { createOrganization, getMyOrganization } from '#controllers/organization.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import schemaValidatorMiddleware from '#middleware/schemaValidator.middleware.js';
import { createOrganizationSchema } from '#validations/organization.validator.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.post('/', schemaValidatorMiddleware(createOrganizationSchema), createOrganization);

router.get('/me', getMyOrganization);

export default router;