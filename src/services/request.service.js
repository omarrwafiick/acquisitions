import NotFoundException from "#exceptions/notFound.exception.js";
import { users } from "#models/user.model.js";
import { findOne } from "#repositories/main.repository.js";
import { and, eq } from "drizzle-orm";

export const listRequests = async (query) => {};

export const getRequestById = async (id) => {};

export const submitRequest = async (payload) => {
    const { org_id, user_id } = payload;

    const userExist = await findOne(
        users,
        and(
            eq(users.id, user_id),
            eq(users.org_id, org_id),
        )
    );

    if(!userExist)
        throw new NotFoundException("user was not found with organization passed.");

    const newRequest = {
        id: 0
    }

    await createAuditLogService({
        org_id,
        actor_id: user_id,
        entity_type: 'request',
        entity_id: newRequest.id,
        action: 'submit_request',
        metadata: {}
    });
};
