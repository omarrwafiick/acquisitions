import express from 'express';
import {
  createPurchaseOrderController,
  listPurchaseOrdersController,
  getPurchaseOrderByIdController,
  sendPurchaseOrderController,
  completePurchaseOrderController,
} from '#controllers/purchaseOrder.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import schemaValidatorMiddleware from '#middleware/schemaValidator.middleware.js';
import roleBasedAccessControlMiddleware from '#middleware/roleBasedAccessControl.middleware.js';
import { createPurchaseOrderSchema } from '#validations/purchaseOrder.validator.js';
import { CONSTANTS } from '#services/constants.service.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.post(
  '/list',
  roleBasedAccessControlMiddleware([
    CONSTANTS.ROLES.MODERATOR
  ]),
  listPurchaseOrdersController
);

router.get(
  '/:id',
  roleBasedAccessControlMiddleware([
    CONSTANTS.ROLES.MODERATOR
  ]),
  getPurchaseOrderByIdController
);

router.use(roleBasedAccessControlMiddleware([CONSTANTS.ROLES.MODERATOR]));

router.post(
  '/',
  schemaValidatorMiddleware(createPurchaseOrderSchema),
  createPurchaseOrderController
);

router.post('/:id/send', sendPurchaseOrderController);

router.post('/:id/complete', completePurchaseOrderController);

export default router;
