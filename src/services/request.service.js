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
import { db } from '#config/database.js';

export const listRequestsService = async (query = {}, payload) => {
  const { org_id } = payload;

  const rows = await db
    .select()
    .from(requests)
    .where(eq(requests.org_id, org_id))
    .limit(query.end ?? 20)
    .offset(query.start ?? 0);

  return rows;
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

  await isUserLinkedToOrganizationService(org_id, user_id);

  const request = await create(requests, {
    org_id,
    created_by: user_id,
    title,
    reason,
    status: CONSTANTS.REQUEST.STATUS.SUBMITTED,
  });

  if (!request)
    throw new Error('Failed to create request');

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