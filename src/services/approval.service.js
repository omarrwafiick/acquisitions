import { users } from '#models/user.model.js';
import { findMany, findOne } from '#repositories/main.repository.js';
import { and, eq, sql } from 'drizzle-orm';
import { createAuditLogService } from './auditLog.service.js';
import NotFoundException from '#exceptions/notFound.exception.js';
import { db } from '#config/database.js';
import { requests } from '#models/request.model.js';
import ForbiddenException from '#exceptions/forbidden.exception.js';
import { CONSTANTS } from './constants.service.js';
import logger, { logEventObj } from '#config/logger.js';

export const listPendingApprovalsService = async (query = {}, payload) => {
  const { org_id } = payload;
  return await findMany(
    requests,
    and(
      eq(requests.org_id, org_id),
      eq(requests.status, CONSTANTS.REQUEST.STATUS.SUBMITTED)
    ),
    query.start ?? 0,
    query.end ?? 20
  );
};

export const changeRequestStateService = async payload => {
  const { requestId, approverId, org_id, newStatus, updateReason } = payload;
  await checkRequestAndApprover(requestId, approverId);

  await db.transaction(async trx => {
    const request = (
      await trx.execute(sql`
                SELECT *
                FROM requests
                WHERE id = ${requestId}
                AND org_id = ${org_id}
                FOR UPDATE
            `)
    ).rows[0];

    if (!request) throw new NotFoundException('Request was not found.');

    await handleStateChangeCases({
      trx,
      request,
      newStatus,
      approverId,
      updateReason,
    });

    await trx.execute(sql`
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
            ${approverId},
            ${'request'},
            ${request.id},
            ${`change_state_${newStatus}`},
            ${JSON.stringify({})}::jsonb
        )
    `);
  });
};

const handleStateChangeCases = async payload => {
  const { trx, request, newStatus, approverId, updateReason } = payload;

  const currentStatus = request.status;

  const isValidTransition =
    (currentStatus === CONSTANTS.REQUEST.STATUS.SUBMITTED &&
      newStatus === CONSTANTS.REQUEST.STATUS.APPROVED) ||
    (currentStatus === CONSTANTS.REQUEST.STATUS.APPROVED &&
      newStatus === CONSTANTS.REQUEST.STATUS.COMPLETED) ||
    (currentStatus === CONSTANTS.REQUEST.STATUS.SUBMITTED &&
      newStatus === CONSTANTS.REQUEST.STATUS.REJECTED);

  if (!isValidTransition){
    const errorMessage = `Invalid status change from ${currentStatus} to ${newStatus}.`;
    logger.error(logEventObj(errorMessage,
        approverId,
        request.org_id,
        "Request",
        request.id
      )
    );
    throw new ForbiddenException(errorMessage);
  }

  await trx
    .update(requests)
    .set({
      status: newStatus,
      approver_id: approverId,
      updated_at: sql`NOW()`,
      update_reason: updateReason,
    })
    .where(eq(requests.id, request.id));

  logger.info(logEventObj(
      `Valid status change from ${currentStatus} to ${newStatus}.`,
      approverId,
      request.org_id,
      "Request",
      request.id
    )
  );
};

const checkRequestAndApprover = async (requestId, approverId) => {
  const [request, approver] = await Promise.all([
    findOne(requests, eq(requests.id, requestId)),
    findOne(users, eq(users.id, approverId)),
  ]);

  if (approver.role !== CONSTANTS.ROLES.APPROVER)
    throw new ForbiddenException('User is not in role.');

  if (!request || !approver)
    throw new NotFoundException(
      'Entities was not found using ids you provided.'
    );

  return { request, approver };
};
