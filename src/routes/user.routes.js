import express from 'express';
import { listUsersController } from '#controllers/user.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import roleBasedAccessControlMiddleware from '#middleware/roleBasedAccessControl.middleware.js';
import isMyOrganizationMiddleware from '#middleware/isMyOrganization.middleware.js';
import { CONSTANTS } from '#services/constants.service.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.use(roleBasedAccessControlMiddleware([CONSTANTS.ROLES.MODERATOR]));

router.use(isMyOrganizationMiddleware);

router.get('/', listUsersController);

export default router;