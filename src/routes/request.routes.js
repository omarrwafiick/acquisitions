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
import {
  createRequestSchema,
  updateRequestSchema,
} from '#validations/request.validator.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.post('/', schemaValidatorMiddleware(createRequestSchema), createRequest);

router.get('/', listRequests);

router.get('/:id', getRequestById);

router.patch('/:id', schemaValidatorMiddleware(updateRequestSchema), updateDraftRequest);

router.post('/:id/submit', submitRequest);

export default router;