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
import isMyOrganizationMiddleware from '#middleware/isMyOrganization.middleware.js';
import roleBasedAccessControlMiddleware from '#middleware/roleBasedAccessControl.middleware.js';
import { createPurchaseOrderSchema } from '#validations/purchaseOrder.validator.js';
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
  listPurchaseOrders
);

router.get('/:id', 
  roleBasedAccessControlMiddleware([
      CONSTANTS.ROLES.MODERATOR, 
      CONSTANTS.ROLES.REQUESTER,
      CONSTANTS.ROLES.APPROVER,
    ]
  ),
  getPurchaseOrderById
);

router.use(roleBasedAccessControlMiddleware([CONSTANTS.ROLES.MODERATOR]));

router.post('/', schemaValidatorMiddleware(createPurchaseOrderSchema), createPurchaseOrder);

router.post('/:id/send', sendPurchaseOrder);

router.post('/:id/complete', completePurchaseOrder);

export default router;