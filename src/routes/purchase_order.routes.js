import express from 'express';
import {
  createPurchaseOrder,
  listPurchaseOrders,
  getPurchaseOrderById,
  sendPurchaseOrder,
  completePurchaseOrder,
} from '#controllers/purchaseOrder.controller.js';
import authenticationMiddleware from '#middleware/authentication.middleware.js';
import schemaValidatorMiddleware from '#middleware/schemaValidator.middleware.js';
import { createPurchaseOrderSchema } from '#validations/purchaseOrder.validator.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.post('/', schemaValidatorMiddleware(createPurchaseOrderSchema), createPurchaseOrder,);

router.get('/', listPurchaseOrders);

router.get('/:id', getPurchaseOrderById);

router.post('/:id/send', sendPurchaseOrder);

router.post('/:id/complete', completePurchaseOrder);

export default router;