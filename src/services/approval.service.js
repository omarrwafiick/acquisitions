import { users } from "#models/user.model.js";
import { findMany, findOne } from "#repositories/main.repository.js";
import { eq } from "drizzle-orm";
import { createAuditLogService } from "./auditLog.service";
import NotFoundException from '#exceptions/notFound.exception.js';
import { approvals } from "#models/approval.model.js";

export const listPendingApprovals = async (query = {}, { org_id }) => {
    return await findMany(
        approvals,
        eq(approvals.org_id, org_id),
        query.start ?? 0,
        query.end ?? 20,
    );
};

export const approveRequest = async ({ requestId, approverId, org_id }) => {
    const { requester, approver } = await fetchRequesterAndApprover(requestId, approverId);

    await createAuditLogService({
        org_id,
        actor_id: approver.id,
        entity_type: 'requester',
        entity_id: requester.id,
        action: 'approve_request',
        metadata: {}
    });
};

export const rejectRequest = async ({ requestId, approverId, org_id }) => {
    const { requester, approver } = await fetchRequesterAndApprover(requestId, approverId);

    await createAuditLogService({
        org_id,
        actor_id: approver.id,
        entity_type: 'requester',
        entity_id: requester.id,
        action: 'approve_request',
        metadata: {}
    });
};

const fetchRequesterAndApprover = async (requestId, approverId) => {
    const [requester, approver] = await Promise.all([
        findOne(users, eq(users.id, requestId)),
        findOne(users, eq(users.id, approverId)),
    ]);
    
    if(!requester || !approver)
        throw new NotFoundException('entities was not found using ids you provided.');

    return { requester, approver }
};
