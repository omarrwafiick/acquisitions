import NotFoundException from "#exceptions/notFound.exception.js";
import { users } from "#models/user.model.js";
import { and, eq } from "drizzle-orm";
import { createAuditLogService } from "./auditLog.service";
import { findOne } from "#repositories/main.repository.js";

export const createPurchaseOrder = async (payload) => {
    const { org_id, user_id } = payload;

    await isUserExist(org_id, user_id);

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

export const listPurchaseOrders = async (query) => {};

export const getPurchaseOrderById = async (id) => {};

export const sendPurchaseOrder = async (payload) => {
    const { org_id, user_id } = payload;

    await isUserExist(org_id, user_id);

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

export const completePurchaseOrder = async (payload) => {
    const { org_id, user_id } = payload;

    await isUserExist(org_id, user_id);

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

const isUserExist = async (org_id, user_id) => {
    const user = await findOne(
        users,
        and(
            eq(users.id, user_id),
            eq(users.org_id, org_id),
        )
    );

    if(!user)
        throw new NotFoundException("user was not found with organization passed.");

    return user;
};