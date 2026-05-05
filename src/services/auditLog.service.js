import { create, findMany } from '#repositories/main.repository.js';
import { audit_logs } from '#models/audit_log.model.js';
import { organizations } from '#models/organization.model.js';

export const listAuditLogsService = async (query, { org_id }) => {
    return await findMany(audit_logs, 
        eq(organizations.id, org_id),
        query.start,
        query.end,
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
