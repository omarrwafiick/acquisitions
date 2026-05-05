import { findMany } from '#repositories/main.repository.js';
import { audit_logs } from '#models/audit_log.model.js';
import { organizations } from '#models/organization.model.js';

export const listAuditLogsService = async (query, req) => {
    //TODOS:
    //query can be extended for search as controller pass req.options sent from clients
    return await findMany(audit_logs, 
        eq(organizations.id, req.user.org_id)
    );
};
