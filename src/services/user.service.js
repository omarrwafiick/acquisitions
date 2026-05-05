import { findMany } from '#repositories/main.repository.js';
import { users } from '#models/user.model.js';
import { and, eq, not } from 'drizzle-orm';
import { organizations } from '#models/organization.model.js';

export const listUsersService = async (query, { user_id, org_id }) => {
    return await findMany(users, 
        and(
            eq(organizations.id, org_id),
            not(users.id, user_id)
        ),
        query.start,
        query.end,
    );
};