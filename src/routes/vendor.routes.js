import express from 'express';
import {
  createVendor,
  listVendors,
  getVendorById,
} from '#controllers/vendor.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import schemaValidatorMiddleware from '#middleware/schemaValidator.middleware.js';
import { createVendorSchema } from '#validations/vendor.validator.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.post('/', schemaValidatorMiddleware(createVendorSchema), createVendor);

router.get('/', listVendors);

router.get('/:id', getVendorById);

export default router;