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

const router = express.Router();

router.use(authenticationMiddleware);

router.use(roleBasedAccessControlMiddleware(['approver']));

router.get('/pending', listPendingApprovalsController);

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
