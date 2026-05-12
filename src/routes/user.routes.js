import express from 'express';
import { listUsersController } from '#controllers/user.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import roleBasedAccessControlMiddleware from '#middleware/roleBasedAccessControl.middleware.js';
import { CONSTANTS } from '#services/constants.service.js';
import { readListSchema } from '#validations/reads.validator.js';
import schemaValidatorMiddleware from '#middleware/schemaValidator.middleware.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.use(roleBasedAccessControlMiddleware([CONSTANTS.ROLES.MODERATOR]));

router.post(
  '/list',
  schemaValidatorMiddleware(readListSchema),
  listUsersController
);

export default router;
