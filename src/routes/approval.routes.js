import express from 'express';
import {
  listPendingApprovalsController,
  approveRequestController,
  rejectRequestController,
} from '#controllers/approval.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import roleBasedAccessControlMiddleware from '#middleware/roleBasedAccessControl.middleware.js';
import { updateRequestSchema } from '#validations/request.validator.js';
import schemaValidatorMiddleware from '#middleware/schemaValidator.middleware.js';
import { readListSchema } from '#validations/reads.validator.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.use(roleBasedAccessControlMiddleware(['approver']));

router.post(
  '/list/pending',
  schemaValidatorMiddleware(readListSchema),
  listPendingApprovalsController);

router.post(
  '/:id/approve',
  schemaValidatorMiddleware(updateRequestSchema),
  approveRequestController
);

router.post(
  '/:id/reject',
  schemaValidatorMiddleware(updateRequestSchema),
  rejectRequestController
);

export default router;
