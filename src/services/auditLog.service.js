import { create, findMany, findOne } from '#repositories/main.repository.js';
import { audit_logs } from '#models/audit_log.model.js';
import { organizations } from '#models/organization.model.js';
import { and, eq } from 'drizzle-orm';

export const listAuditLogsService = async (query = {}, payload) => {
  const { org_id } = payload;
  return await findMany(
    audit_logs,
    eq(audit_logs.org_id, org_id),
    query.start || 0,
    query.end || 20
  );
};

export const getAuditLogsByEntityIdService = async payload => {
  const { entity_id, org_id } = payload;
  return await findMany(
    audit_logs,
    and(eq(audit_logs.entity_id, entity_id), eq(audit_logs.org_id, org_id))
  );
};

export const createAuditLogService = async payload => {
  const { org_id, actor_id, entity_type, entity_id, action, metadata } =
    payload;
  return await create(audit_logs, {
    org_id,
    actor_id,
    entity_id,
    entity_type,
    action,
    metadata,
  });
};
