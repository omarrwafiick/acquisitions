import express from 'express';
import {
  listRequests,
  getRequestById,
  submitRequest,
} from '#controllers/request.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import schemaValidatorMiddleware from '#middleware/schemaValidator.middleware.js';
import isMyOrganizationMiddleware from '#middleware/isMyOrganization.middleware.js';
import roleBasedAccessControlMiddleware from '#middleware/roleBasedAccessControl.middleware.js';
import {
  createRequestSchema,
  updateRequestSchema,
} from '#validations/request.validator.js';
import { CONSTANTS } from '#services/constants.service.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.use(isMyOrganizationMiddleware);

router.get('/', 
  roleBasedAccessControlMiddleware([CONSTANTS.ROLES.APPROVER, CONSTANTS.ROLES.REQUESTER]),
  listRequests
);

router.get('/:id',
  roleBasedAccessControlMiddleware([CONSTANTS.ROLES.APPROVER, CONSTANTS.ROLES.REQUESTER]),
  getRequestById
);

router.post('/:id/submit', 
  roleBasedAccessControlMiddleware([CONSTANTS.ROLES.REQUESTER]),
  submitRequest
);

export default router;