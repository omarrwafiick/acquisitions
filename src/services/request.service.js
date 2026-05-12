import NotFoundException from '#exceptions/notFound.exception.js';
import { requests } from '#models/request.model.js';
import { users } from '#models/user.model.js';
import {
  create,
  createMany,
  findMany,
  findManyWithJoin,
  findOne,
} from '#repositories/main.repository.js';
import { and, desc, eq } from 'drizzle-orm';
import { isUserLinkedToOrganizationService } from './user.service.js';
import { request_items } from '#models/request_item.model.js';
import logger, { logEventObj } from '#config/logger.js';
import { createAuditLogService } from './auditLog.service.js';
import { CONSTANTS } from './constants.service.js';
import DuplicateException from '#exceptions/duplicate.exception.js';
import ForbiddenException from '#exceptions/forbidden.exception.js';

export const listRequestsService = async (query = {}, payload) => {
  const { org_id } = payload;

  const rows = await findManyWithJoin(
    requests,
    request_items,
    eq(requests.org_id, org_id),
    eq(requests.id, request_items.request_id),
    undefined,
    query.start || 0,
    query.end || 20
  );

  const grouped = rows.reduce((acc, row) => {
    const r = row.requests;
    const item = row.request_items;

    if (!acc[r.id]) {
      acc[r.id] = {
        id: r.id,
        org_id: r.org_id,
        created_by: r.created_by,
        approver_id: r.approver_id,
        updated_at: r.updated_at,
        update_reason: r.update_reason,
        title: r.title,
        reason: r.reason,
        status: r.status,
        created_at: r.created_at,
        items: []
      };
    }

    if (item?.id) {
      acc[r.id].items.push({
        id: item.id,
        request_id: item.request_id,
        name: item.name,
        quantity: item.quantity,
        estimated_price: item.estimated_price,
      });
    }

    return acc;
  }, {});

  return Object.values(grouped);
};

export const getRequestByIdService = async payload => {
  const { id, org_id } = payload;
  const result = await findOne(
    requests,
    and(eq(requests.id, id), eq(requests.org_id, org_id))
  );
  
  if (!result) 
    throw new NotFoundException('Request not found');
  
  return result;
};

export const submitRequestService = async payload => {
  const { title, reason, items, org_id, user_id } = payload;

  const user = await isUserLinkedToOrganizationService(org_id, user_id);

  if(!user.role || user.role !== CONSTANTS.ROLES.REQUESTER)
    throw new ForbiddenException('User is not in a requester role.');

  const requestExists = await findOne(
    requests,
    and(
      eq(requests.title, title),
      eq(requests.org_id, org_id),
      eq(requests.created_by, user_id),
      eq(requests.status, CONSTANTS.REQUEST.STATUS.SUBMITTED)
    )
  );

  if (requestExists)
    throw new DuplicateException('A request with the same title already exists.');

  const request = await create(requests, {
    org_id,
    created_by: user_id,
    title,
    reason,
    status: CONSTANTS.REQUEST.STATUS.SUBMITTED,
  });

  if (!request)
    throw new Error('Failed to create request.');

  await createMany(request_items, items.map(item => ({
    request_id: request.id,
    name: item.name,
    quantity: item.quantity,
    estimated_price: item.estimatedPrice,
  })));

  await createAuditLogService({
    org_id,
    actor_id: user_id,
    entity_type: 'Request',
    entity_id: request.id,
    action: 'submitted',
    metadata: {
      title,
      itemsCount: items.length,
    },
  });

  logger.info(
    logEventObj('Create request', user_id, org_id, 'Request', request.id, {
      title,
      itemsCount: items.length,
    })
  );

  return request;
};