import express from 'express';
import {
  listRequestsController,
  getRequestByIdController,
  submitRequestController,
} from '#controllers/request.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import schemaValidatorMiddleware from '#middleware/schemaValidator.middleware.js';
import roleBasedAccessControlMiddleware from '#middleware/roleBasedAccessControl.middleware.js';
import {
  submitRequestSchema,
  updateRequestSchema,
} from '#validations/request.validator.js';
import { CONSTANTS } from '#services/constants.service.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.post('/', 
  roleBasedAccessControlMiddleware([CONSTANTS.ROLES.APPROVER, CONSTANTS.ROLES.REQUESTER]),
  listRequestsController
);

router.get('/:id',
  roleBasedAccessControlMiddleware([CONSTANTS.ROLES.APPROVER, CONSTANTS.ROLES.REQUESTER]),
  getRequestByIdController
);

router.post('/:id/submit', 
  roleBasedAccessControlMiddleware([CONSTANTS.ROLES.REQUESTER]),
  schemaValidatorMiddleware(submitRequestSchema),
  submitRequestController
);

export default router;