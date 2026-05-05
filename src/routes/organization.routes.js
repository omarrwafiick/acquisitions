import express from 'express';
import { createOrganization, getMyOrganization } from '#controllers/organization.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import schemaValidatorMiddleware from '#middleware/schemaValidator.middleware.js';
import roleBasedAccessControlMiddleware from '#middleware/roleBasedAccessControl.middleware.js';
import { createOrganizationSchema } from '#validations/organization.validator.js';
import isMyOrganizationMiddleware from '#middleware/isMyOrganization.middleware.js';

const router = express.Router();

router.post('/', schemaValidatorMiddleware(createOrganizationSchema), createOrganization);

router.use(authenticationMiddleware);

router.use(authenticationMiddleware);

router.use(roleBasedAccessControlMiddleware(['moderator', 'requester', 'approver']));

router.get('/me', getMyOrganization);

export default router;