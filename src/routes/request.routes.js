import express from 'express';
import {
  createRequest,
  listRequests,
  getRequestById,
  updateDraftRequest,
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

const router = express.Router();

router.use(authenticationMiddleware);

router.use(isMyOrganizationMiddleware);

router.post('/', 
  roleBasedAccessControlMiddleware(['requester']),
  schemaValidatorMiddleware(createRequestSchema), 
  createRequest
);

router.get('/', 
  roleBasedAccessControlMiddleware(['approver', 'requester']),
  listRequests
);

router.get('/:id',
  roleBasedAccessControlMiddleware(['approver', 'requester']),
  getRequestById
);

router.patch('/:id',
  roleBasedAccessControlMiddleware(['requester']),
  schemaValidatorMiddleware(updateRequestSchema),
  updateDraftRequest
);

router.post('/:id/submit', 
  roleBasedAccessControlMiddleware(['requester']),
  submitRequest
);

export default router;