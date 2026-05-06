import NotFoundException from "#exceptions/notFound.exception.js";
import { requests } from "#models/request.model.js";
import { users } from "#models/user.model.js";
import { findMany, findOne } from "#repositories/main.repository.js";
import { and, eq } from "drizzle-orm";
import { isUserLinkedToOrganizationService } from "./user.service.js";

export const listRequestsService = async (query = {}, { org_id }) => {
    return await findMany(
        requests,
        eq(requests.org_id, org_id),
        query.start ?? 0,
        query.end ?? 20,
    );
};

export const getRequestByIdService = async ({ id, org_id }) => {
    return await findOne(
        requests,
        and(
            eq(requests.id, id),
            eq(requests.org_id, org_id)
        )
    );
};

export const submitRequestService = async (payload) => {
    const { org_id, user_id } = payload;

    await isUserLinkedToOrganizationService(org_id, user_id);

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
