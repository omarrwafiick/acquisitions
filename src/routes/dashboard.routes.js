import express from 'express';
import { getDashboardSummaryController } from '#controllers/dashboard.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import isMyOrganizationMiddleware from '#middleware/isMyOrganization.middleware.js';
import roleBasedAccessControlMiddleware from '#middleware/roleBasedAccessControl.middleware.js';
import { CONSTANTS } from '#services/constants.service.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.use(roleBasedAccessControlMiddleware([
        CONSTANTS.ROLES.MODERATOR,
        CONSTANTS.ROLES.REQUESTER,
        CONSTANTS.ROLES.APPROVER,
    ]
));

router.use(isMyOrganizationMiddleware);

router.get('/summary', getDashboardSummaryController);

export default router;