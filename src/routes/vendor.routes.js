import express from 'express';
import {
  createVendorController,
  listVendorsController,
  getVendorByIdController,
} from '#controllers/vendor.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import schemaValidatorMiddleware from '#middleware/schemaValidator.middleware.js';
import roleBasedAccessControlMiddleware from '#middleware/roleBasedAccessControl.middleware.js';
import isMyOrganizationMiddleware from '#middleware/isMyOrganization.middleware.js';
import { createVendorSchema } from '#validations/vendor.validator.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.use(isMyOrganizationMiddleware);

router.get('/', 
  roleBasedAccessControlMiddleware(['moderator', 'requester', 'approver']),
  listVendorsController
);

router.get('/:id',
  roleBasedAccessControlMiddleware(['moderator', 'requester', 'approver']),
  getVendorByIdController
);

router.post('/',
  roleBasedAccessControlMiddleware(['moderator']),
  schemaValidatorMiddleware(createVendorSchema), 
  createVendorController
);

export default router;