import NotFoundException from '#exceptions/notFound.exception.js';
import { users } from '#models/user.model.js';
import { and, eq, sql } from 'drizzle-orm';
import { createAuditLogService } from './auditLog.service.js';
import {
  create,
  findMany,
  findManyWithJoin,
  findOne,
  findOneWithJoin,
  updateOne,
} from '#repositories/main.repository.js';
import { purchase_orders } from '#models/purchase_order.model.js';
import { requests } from '#models/request.model.js';
import { isUserLinkedToOrganizationService } from './user.service.js';
import { CONSTANTS } from './constants.service.js';
import ForbiddenException from '#exceptions/forbidden.exception.js';
import { vendors } from '#models/vendor.mode.js';
import { sendEmailService, vendorEmailBodyBuilder } from './email.service.js';
import logger, { logEventObj } from '#config/logger.js';
import { request_items} from '#models/request_item.model.js';

export const listPurchaseOrdersService = async (query = {}, payload) => {
  const { org_id } = payload;
  return await findManyWithJoin(
    purchase_orders,
    requests,
    eq(requests.org_id, org_id),
    eq(purchase_orders.request_id, requests.id),
    {
      id: purchase_orders.id,
      request_id: purchase_orders.request_id,
      vendor_id: purchase_orders.vendor_id,
      created_by: purchase_orders.created_by,
      status: purchase_orders.status,
      total_amount: purchase_orders.total_amount,
      created_at: purchase_orders.created_at,
      request_title: requests.title,
      request_reason: requests.reason,
      request_status: requests.status,
      request_created_at: requests.created_at,
    },
    query.start ?? 0,
    query.end ?? 20
  );
};

export const getPurchaseOrderByIdService = async payload => {
  const { id, org_id } = payload;
  return await findOneWithJoin(
    purchase_orders,
    requests,
    and(eq(purchase_orders.id, id), eq(requests.org_id, org_id)),
    eq(purchase_orders.request_id, requests.id)
  );
};

export const createPurchaseOrderService = async payload => {
  const { org_id, user_id, request_id, vendor_id, total_amount, approval_reason } = payload;

  await isUserLinkedToOrganizationService(org_id, user_id);

  const [request, vendor, existingPO] = await Promise.all([
    findOne(
      requests,
      and(eq(requests.id, request_id), eq(requests.org_id, org_id))
    ),
    findOne(
      vendors,
      and(eq(vendors.id, vendor_id), eq(vendors.org_id, org_id))
    ),
    findOne(purchase_orders, eq(purchase_orders.request_id, request_id)),
  ]);
;
  if (!request || request.status !== CONSTANTS.REQUEST.STATUS.APPROVED)
    throw new ForbiddenException('Request was not approved or found');

  if (!vendor) 
    throw new NotFoundException('Vendor not found');

  if (existingPO)
    throw new ForbiddenException(
      'Purchase order already exists for this request'
    );

  const requestItems = await findMany(request_items, eq(request_items.request_id, request_id));

  if (!requestItems) 
    throw new NotFoundException('Request items not found');

  const totalEstimatedAmount = requestItems.reduce((total, item) => {
    return total + item.quantity * item.estimated_price;
  }, 0);

  if (total_amount < totalEstimatedAmount && !approval_reason)
    throw new ForbiddenException(
      'A reason is required when approving an amount lower than the estimated total.'
    );

  const newPurchaseOrder = await create(purchase_orders, {
    request_id,
    vendor_id,
    created_by: user_id,
    status: CONSTANTS.PURCHASE_ORDER.STATUS.AWAITING,
    total_amount: Number(total_amount),
  });

  await createAuditLogService({
    org_id,
    actor_id: user_id,
    entity_type: 'purchase_order',
    entity_id: newPurchaseOrder.id,
    action: 'create_purchase_order',
    metadata: {
      request_id,
      vendor_id,
      total_amount,
      approval_reason
    },
  });

  return newPurchaseOrder;
};

const handlePurchaseOrderStateChange = async ({
  org_id,
  user_id,
  purchase_order_id,
  allowedFrom,
  newStatus,
  actionName,
  metadata = {},
  sideEffect,
}) => {
  await isUserLinkedToOrganizationService(org_id, user_id);

  const purchaseOrder = await findOne(
    purchase_orders,
    eq(purchase_orders.id, purchase_order_id)
  );

  if (!purchaseOrder)
    throw new NotFoundException('Purchase order not found');

  const request = await findOne(
    requests,
    eq(requests.id, purchaseOrder.request_id)
  );

  if (!request)
    throw new NotFoundException('Associated request not found');

  if (request.org_id !== org_id)
    throw new ForbiddenException('Unauthorized access');

  if (!allowedFrom.includes(purchaseOrder.status))
    throw new ForbiddenException(
      `Invalid state transition from ${purchaseOrder.status}`
    );

  await updateOne(
    purchase_orders,
    {
      status: newStatus,
      updated_at: sql`NOW()`,
    },
    eq(purchase_orders.id, purchase_order_id)
  );

  await createAuditLogService({
    org_id,
    actor_id: user_id,
    entity_type: 'purchase_order',
    entity_id: purchase_order_id,
    action: actionName,
    metadata: {
      from: purchaseOrder.status,
      to: newStatus,
      ...metadata,
    },
  });

  logger.info(
    logEventObj(
      actionName,
      user_id,
      org_id,
      'Purchase Order',
      purchase_order_id,
      metadata
    )
  );

  if (sideEffect) {
    await sideEffect({ purchaseOrder, request, org_id, user_id });
  }

  return {
    id: purchase_order_id,
    status: newStatus,
  };
};

export const sendPurchaseOrderService = async payload => {
  return handlePurchaseOrderStateChange({
    ...payload,
    allowedFrom: [CONSTANTS.PURCHASE_ORDER.STATUS.AWAITING],
    newStatus: CONSTANTS.PURCHASE_ORDER.STATUS.SENT,
    actionName: 'send_purchase_order',

    metadata: {
      status: CONSTANTS.PURCHASE_ORDER.STATUS.SENT,
    },

    sideEffect: async ({ purchaseOrder }) => {
      await handleVendorSentRequest(purchaseOrder);
    },
  });
};

export const completePurchaseOrderService = async payload => {
  return handlePurchaseOrderStateChange({
    ...payload,
    allowedFrom: [CONSTANTS.PURCHASE_ORDER.STATUS.SENT],
    newStatus: CONSTANTS.PURCHASE_ORDER.STATUS.COMPLETED,
    actionName: 'complete_purchase_order',

    metadata: {
      status: CONSTANTS.PURCHASE_ORDER.STATUS.COMPLETED,
    },

    sideEffect: async ({ purchaseOrder }) => {
      logger.log(
        logEventObj(
          'Purchase order completed',
          payload.user_id,
          payload.org_id,
          'Purchase Order',
          purchaseOrder.id,
          {
            completedAfterTimeStamp:
              purchaseOrder.updated_at - purchaseOrder.created_at,
          }
        )
      );
    },
  });
};

const handleVendorSentRequest = async purchaseOrder => {
  const [requester, vendor] = await Promise.all([
    findOne(users, eq(users.id, purchaseOrder.created_by)),
    findOne(vendors, eq(vendors.id, purchaseOrder.vendor_id)),
  ]);

  if (!requester) 
    throw new NotFoundException('Requester not found');

  if (!vendor) 
    throw new NotFoundException('Vendor not found');

  const vendorEmailBody = vendorEmailBodyBuilder({ vendor, purchaseOrder });

  logger.debug(
    logEventObj(
      'Send purchase order email to vendor',
      requester.id,
      requester.org_id,
      'Purchase Order',
      purchaseOrder.id,
      {
        purchase_order_id: purchaseOrder.id,
        sentTo: vendor.email,
        sendBy: requester.email,
      }
    )
  );

  await sendEmailService(
    requester.email,
    vendor.email,
    'Official Purchase Order Request.',
    vendorEmailBody
  );
};
