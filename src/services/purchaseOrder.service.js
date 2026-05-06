import NotFoundException from "#exceptions/notFound.exception.js";
import { users } from "#models/user.model.js";
import { and, eq } from "drizzle-orm";
import { createAuditLogService } from "./auditLog.service";
import { findMany, findManyWithJoin, findOne, findOneWithJoin } from "#repositories/main.repository.js";
import { purchase_orders } from "#models/purchase_order.model.js";
import { requests } from "#models/request.model.js";
import { isUserLinkedToOrganizationServiceService } from "./user.service";

export const createPurchaseOrderService = async (payload) => {
    const { org_id, user_id } = payload;

    await isUserLinkedToOrganizationService(org_id, user_id);

    const newPurchaseOrder = {
        id: 0
    }

    await createAuditLogService({
        org_id,
        actor_id: user_id,
        entity_type: 'purchase_order',
        entity_id: newPurchaseOrder.id,
        action: 'create_purchase_order',
        metadata: {}
    });
};

export const listPurchaseOrdersService = async (query = {}, { org_id }) => {
    return await findManyWithJoin(
        purchase_orders,
        requests,
        eq(requests.org_id, org_id),
        eq(purchase_orders.request_id, requests.id),
        query.start ?? 0,
        query.end ?? 20,
    );
};
export const getPurchaseOrderByIdService = async ({ id, org_id }) => {
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

export const sendPurchaseOrderService = async (payload) => {
    const { org_id, user_id } = payload;

    await isUserLinkedToOrganizationService(org_id, user_id);

    const newPurchaseOrder = {
        id: 0
    }
    
    await createAuditLogService({
        org_id,
        actor_id: user_id,
        entity_type: 'purchase_order',
        entity_id: newPurchaseOrder.id,
        action: 'send_purchase_order',
        metadata: {}
    });
};

export const completePurchaseOrderService = async (payload) => {
    const { org_id, user_id } = payload;

    await isUserLinkedToOrganizationServiceService(org_id, user_id);

    const newPurchaseOrder = {
        id: 0
    }

    await createAuditLogService({
        org_id,
        actor_id: user_id,
        entity_type: 'purchase_order',
        entity_id: newPurchaseOrder.id,
        action: 'complete_purchase_order',
        metadata: {}
    });
};