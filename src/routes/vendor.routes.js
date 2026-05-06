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
import { CONSTANTS } from '#services/constants.service.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.use(isMyOrganizationMiddleware);

router.get('/', 
  roleBasedAccessControlMiddleware([
      CONSTANTS.ROLES.MODERATOR,
      CONSTANTS.ROLES.REQUESTER,
      CONSTANTS.ROLES.APPROVER,
    ]
  ),
  listVendorsController
);

router.get('/:id',
  roleBasedAccessControlMiddleware([
      CONSTANTS.ROLES.MODERATOR, 
      CONSTANTS.ROLES.REQUESTER,
      CONSTANTS.ROLES.APPROVER,
    ]
  ),
  getVendorByIdController
);

router.post('/',
  roleBasedAccessControlMiddleware([CONSTANTS.ROLES.MODERATOR]),
  schemaValidatorMiddleware(createVendorSchema), 
  createVendorController
);

export default router;