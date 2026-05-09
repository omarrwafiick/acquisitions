import express from 'express';
import { listAuditLogsController } from '#controllers/auditLog.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import roleBasedAccessControlMiddleware from '#middleware/roleBasedAccessControl.middleware.js';
import { CONSTANTS } from '#services/constants.service.js';
import { readListSchema } from '#validations/reads.validator.js';
import schemaValidatorMiddleware from '#middleware/schemaValidator.middleware.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.post(
  '/list',
  roleBasedAccessControlMiddleware([CONSTANTS.ROLES.MODERATOR]),
  schemaValidatorMiddleware(readListSchema),
  listAuditLogsController
);

export default router;
