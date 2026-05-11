import { users } from '#models/user.model.js';
import { create, findMany, findOne, updateOne } from '#repositories/main.repository.js';
import { and, eq, sql } from 'drizzle-orm';
import { createAuditLogService } from './auditLog.service.js';
import NotFoundException from '#exceptions/notFound.exception.js';
import { db } from '#config/database.js';
import { requests } from '#models/request.model.js';
import ForbiddenException from '#exceptions/forbidden.exception.js';
import { CONSTANTS } from './constants.service.js';
import logger, { logEventObj } from '#config/logger.js';
import { audit_logs } from '#models/audit_log.model.js';

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
  const {
    requestId,
    approverId,
    org_id,
    newStatus,
    updateReason,
  } = payload;

  await checkRequestAndApprover(requestId, approverId);

  const requestRows = await db.execute(sql`
    SELECT *
    FROM requests
    WHERE id = ${requestId}
    AND org_id = ${org_id}
    FOR UPDATE
  `);

  const request = requestRows.rows?.[0];

  if (!request)
    throw new NotFoundException('Request was not found.');

  await handleStateChangeCases({
    request,
    newStatus,
    approverId,
    updateReason,
  });

  await create(audit_logs, {
    org_id,
    actor_id: approverId,
    entity_type: 'request',
    entity_id: request.id,
    action: `change_state_${newStatus}`,
    metadata: {},
  });

  return {
    id: request.id,
    status: newStatus,
  };
};

const handleStateChangeCases = async payload => {
  const {
    request,
    newStatus,
    approverId,
    updateReason,
  } = payload;

  const currentStatus = request.status;

  const isValidTransition =
    (currentStatus === CONSTANTS.REQUEST.STATUS.SUBMITTED &&
      newStatus === CONSTANTS.REQUEST.STATUS.APPROVED) ||
    (currentStatus === CONSTANTS.REQUEST.STATUS.APPROVED &&
      newStatus === CONSTANTS.REQUEST.STATUS.COMPLETED) ||
    (currentStatus === CONSTANTS.REQUEST.STATUS.SUBMITTED &&
      newStatus === CONSTANTS.REQUEST.STATUS.REJECTED) ||
    (currentStatus === CONSTANTS.REQUEST.STATUS.APPROVED &&
      newStatus === CONSTANTS.REQUEST.STATUS.REJECTED);

  if (!isValidTransition) {
    const errorMessage = `Invalid status change from ${currentStatus} to ${newStatus}.`;

    logger.error(
      logEventObj(
        errorMessage,
        approverId,
        request.org_id,
        'Request',
        request.id
      )
    );

    throw new ForbiddenException(errorMessage);
  }

  await updateOne(
    requests,
    {
      status: newStatus,
      approver_id: approverId,
      updated_at: sql`NOW()`,
      update_reason: updateReason,
    },
    eq(requests.id, request.id)
  );

  logger.info(
    logEventObj(
      `Valid status change from ${currentStatus} to ${newStatus}.`,
      approverId,
      request.org_id,
      'Request',
      request.id,
      {
        approvalAfterTimeStamp:
          request.updated_at - request.created_at,
        updateReason,
      }
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
