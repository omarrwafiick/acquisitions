import express from 'express';
import { listAuditLogsController } from '#controllers/auditLog.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import roleBasedAccessControlMiddleware from '#middleware/roleBasedAccessControl.middleware.js';
import { CONSTANTS } from '#services/constants.service.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.post(
  '/',
  roleBasedAccessControlMiddleware([CONSTANTS.ROLES.MODERATOR]),
  listAuditLogsController
);

export default router;
