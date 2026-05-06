import { users } from "#models/user.model.js";
import { findMany, findOne } from "#repositories/main.repository.js";
import { and, eq } from "drizzle-orm";
import { createAuditLogService } from "./auditLog.service.js";
import NotFoundException from '#exceptions/notFound.exception.js';
import { db } from "#config/database.js";
import { requests } from "#models/request.model.js";
import ForbiddenException from '#exceptions/forbidden.exception.js';
import { CONSTANTS } from "./constants.service.js";

export const listPendingApprovalsService = async (query = {}, { org_id }) => {
    return await findMany(
        requests,
        and(
            eq(requests.org_id, org_id),
            eq(requests.status, CONSTANTS.REQUEST.STATUS.SUBMITTED),
        ),
        query.start ?? 0,
        query.end ?? 20,
    );
};

export const changeRequestStateService = async ({ requestId, approverId, org_id, newStatus }) => {
    await checkRequestAndApprover(requestId, approverId);

    await db.transaction(async (tx) => {
        const request = (
            await tx.execute(sql`
                SELECT *
                FROM requests
                WHERE id = ${requestId}
                AND org_id = ${org_id}
                FOR UPDATE
            `)
        ).rows[0];

        if (!request)
            throw new NotFoundException('Request was not found.');

        await handleStateChangeCases({ trx, request, newStatus });

        await tx.execute(sql`
            INSERT INTO audit_logs (
                org_id,
                actor_id,
                entity_type,
                entity_id,
                action,
                metadata
            )
            VALUES (
                ${org_id},
                ${approver.id},
                ${'request'},
                ${request.id},
                ${`change_state_${newStatus}`},
                ${JSON.stringify({})}::jsonb
            )
        `);
    });
};

const handleStateChangeCases = async ({ trx, request, newStatus }) => {
    const currentStatus = request.status;

    if (
        currentStatus === CONSTANTS.REQUEST.STATUS.SUBMITTED && newStatus === CONSTANTS.REQUEST.STATUS.APPROVED ||
        currentStatus === CONSTANTS.REQUEST.STATUS.APPROVED && newStatus === CONSTANTS.REQUEST.STATUS.COMPLETED ||
        currentStatus === CONSTANTS.REQUEST.STATUS.SUBMITTED && newStatus === CONSTANTS.REQUEST.STATUS.REJECTED
    ){
        await tx.execute(sql`
            UPDATE requests
            SET status = '${newStatus}'
            WHERE id = ${request.id}
        `);
    }else {
        throw new ForbiddenException(`Invalid Change status from ${currentStatus} to ${newStatus}.`)
    }; 
}

const checkRequestAndApprover = async (requestId, approverId) => {
    const [request, approver] = await Promise.all([
        findOne(requests, eq(requests.id, requestId)),
        findOne(users, eq(users.id, approverId)),
    ]);

    if(approver.role !== CONSTANTS.ROLES.APPROVER)
        throw new ForbiddenException('User is not in role.');
    
    if(!request || !approver)
        throw new NotFoundException('Entities was not found using ids you provided.');

    return { request, approver }
};
