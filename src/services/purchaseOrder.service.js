import NotFoundException from "#exceptions/notFound.exception.js";
import { users } from "#models/user.model.js";
import { and, eq, sql } from "drizzle-orm";
import { createAuditLogService } from "./auditLog.service.js";
import { create, findMany, findManyWithJoin, findOne, findOneWithJoin, updateOne } from "#repositories/main.repository.js";
import { purchase_orders } from "#models/purchase_order.model.js";
import { requests } from "#models/request.model.js";
import { isUserLinkedToOrganizationService } from "./user.service.js";
import { CONSTANTS } from "./constants.service.js";
import ForbiddenException from '#exceptions/forbidden.exception.js';
import { vendors } from "#models/vendor.mode.js";
import { sendEmailService } from "./email.service.js";

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
        query.end ?? 20,
    );
};

export const getPurchaseOrderByIdService = async (payload) => {
    const { id, org_id } = payload;
    return await findOneWithJoin(
        purchase_orders,
        requests,
        and(
            eq(purchase_orders.id, id),
            eq(requests.org_id, org_id),
        ),
        eq(purchase_orders.request_id, requests.id),
    );
};

export const createPurchaseOrderService = async (payload) => {
    const { org_id, user_id, request_id, vendor_id, total_amount } = payload;

    await isUserLinkedToOrganizationService(org_id, user_id);

    const [request, vendor, existingPO] = await Promise.all([
        findOne(requests,
            and(
                eq(requests.id, request_id),
                eq(requests.org_id, org_id)
            )
        ),
        findOne(vendors,
            and(
                eq(vendors.id, vendor_id),
                eq(vendors.org_id, org_id)
            )
        ),
        findOne(purchase_orders,
            eq(purchase_orders.request_id, request_id)
        )
    ]);

    if (!request || request[0]?.status !== CONSTANTS.REQUEST.STATUS.APPROVED)
        throw new ForbiddenException('Request not approved or not found');

    if (!vendor || !vendor[0]) 
        throw new NotFoundException('Vendor not found');

    if (existingPO.length > 0)
        throw new ForbiddenException('Purchase order already exists for this request');

    const newPurchaseOrder = await create(
        purchase_orders,
        {
            request_id,
            vendor_id,
            created_by: user_id,
            status: CONSTANTS.PURCHASE_ORDER.STATUS.CREATED,
            total_amount,
        }
    );

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
        }
    });

    return newPurchaseOrder;
};

export const sendPurchaseOrderService = async (payload) => {
    const { org_id, user_id, purchase_order_id } = payload;

    await isUserLinkedToOrganizationService(org_id, user_id);

    const purchaseOrder = await findWithJoin(
        purchase_orders,
        requests,
        eq(purchase_orders.id, purchase_order_id),
        eq(purchase_orders.request_id, requests.id),
        {
            id: purchase_orders.id,
            org_id: requests.org_id,
            status: purchase_orders.status,
        }
    );

    if (!purchaseOrder)
        throw new NotFoundException('Purchase order not found');

    if (purchaseOrder.org_id !== org_id)
        throw new ForbiddenException('Unauthorized access to purchase order');

    if (purchaseOrder.status !== CONSTANTS.PURCHASE_ORDER.STATUS.CREATED)
        throw new ForbiddenException('Only created purchase orders can be sent');

    await updateOne(
        purchase_orders,
        {
            status: CONSTANTS.PURCHASE_ORDER.STATUS.SENT,
            updated_at: sql`NOW()`,
        },
        eq(purchase_orders.id, purchase_order_id)
    );

    await handleVendorSentRequest(purchaseOrder);

    await createAuditLogService({
        org_id,
        actor_id: user_id,
        entity_type: 'purchase_order',
        entity_id: purchase_order_id,
        action: 'send_purchase_order',
        metadata: {
            status: CONSTANTS.PURCHASE_ORDER.STATUS.SENT,
        }
    });

    return {
        id: purchase_order_id,
        status: CONSTANTS.PURCHASE_ORDER.STATUS.SENT,
    };
};

const handleVendorSentRequest = async (purchaseOrder) => {
    const [requester, vendor] = await Promise.all([
        findOne(users, eq(users.id, purchaseOrder.created_by)),
        findOne(vendors, eq(vendors.id, purchaseOrder.vendor_id))
    ]);

    if(!requester)
        throw new NotFoundException('Requester not found');

    if(!vendor)
        throw new NotFoundException('Vendor not found');

    const vendorEmailBody = `
        Dear ${vendor.name || 'Partner'},

        You have received a new official Purchase Order.

        Purchase Order Details:
        - PO ID: ${purchaseOrder.id}
        - Status: SENT
        - Total Amount: ${purchaseOrder.total_amount}

        This order has been issued by our procurement team. Please review the attached details and confirm receipt.

        Next Steps:
        1. Acknowledge receipt of this Purchase Order
        2. Confirm estimated delivery timeline
        3. Contact us if any clarification is needed

        We look forward to your prompt response.

        Best regards,
        Procurement Team
    `;

    await sendEmailService(
        requester.email, 
        vendor.email, 
        'Official Purchase Order Request.',
        vendorEmailBody
    );
}

export const completePurchaseOrderService = async (payload) => {
    const { org_id, user_id, purchase_order_id } = payload;

    await isUserLinkedToOrganizationService(org_id, user_id);

    const purchaseOrder = await findOneWithJoin(
        purchase_orders,
        requests,
        eq(purchase_orders.id, purchase_order_id),
        eq(purchase_orders.request_id, requests.id),
        {
            id: purchase_orders.id,
            org_id: requests.org_id,
            status: purchase_orders.status,
        }
    );

    if (!purchaseOrder)
        throw new NotFoundException('Purchase order not found');

    if (purchaseOrder.org_id !== org_id)
        throw new ForbiddenException('Unauthorized access to purchase order');

    if (purchaseOrder.status !== CONSTANTS.PURCHASE_ORDER.STATUS.SENT)
        throw new ForbiddenException('Only sent purchase orders can be completed');

    await updateOne(
        purchase_orders,
        {
            status: CONSTANTS.PURCHASE_ORDER.STATUS.COMPLETED,
            updated_at: sql`NOW()`,
        },
        eq(purchase_orders.id, purchase_order_id)
    );

    await createAuditLogService({
        org_id,
        actor_id: user_id,
        entity_type: 'purchase_order',
        entity_id: purchase_order_id,
        action: 'complete_purchase_order',
        metadata: {
            status: CONSTANTS.PURCHASE_ORDER.STATUS.COMPLETED,
        }
    });

    return {
        id: purchase_order_id,
        status: CONSTANTS.PURCHASE_ORDER.STATUS.COMPLETED,
    };
};