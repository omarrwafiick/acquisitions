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

router.use(roleBasedAccessControlMiddleware('moderator'));

router.use(isMyOrganizationMiddleware);

router.post('/', schemaValidatorMiddleware(createVendorSchema), createVendorController);

router.get('/', listVendorsController);

router.get('/:id', getVendorByIdController);

export default router;