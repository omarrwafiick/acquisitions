import { findMany } from '#repositories/main.repository.js';
import { audit_logs } from '#models/audit_log.model.js';
import { organizations } from '#models/organization.model.js';

export const listAuditLogsService = async (query, { org_id }) => {
    return await findMany(audit_logs, 
        eq(organizations.id, org_id),
        query.start,
        query.end,
    );
};
