import { findMany } from '#repositories/main.repository.js';
import { users } from '#models/user.model.js';
import { and, eq, not } from 'drizzle-orm';
import { organizations } from '#models/organization.model.js';

export const listUsersService = async (query, req) => {
    //TODOS:
    //query can be extended for search as controller pass req.options sent from clients
    return await findMany(users, 
        and(
            eq(organizations.id, req.user.org_id),
            not(users.id, req.user.id)
        )
    );
};