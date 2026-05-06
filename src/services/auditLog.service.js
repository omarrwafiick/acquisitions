import { create, findMany } from '#repositories/main.repository.js';
import { audit_logs } from '#models/audit_log.model.js';
import { organizations } from '#models/organization.model.js';
import { eq } from 'drizzle-orm';

export const listAuditLogsService = async (query, { org_id }) => {
    return await findMany(audit_logs, 
        eq(audit_logs.org_id, org_id),
        query.start || 0,
        query.end || 20,
    );
};

export const createAuditLogService = async ({ org_id, actor_id, entity_type, entity_id, action, metadata}) => {
    return await create(audit_logs, {
        org_id,
        actor_id,
        entity_id,
        entity_type,
        action,
        metadata
    });
};
