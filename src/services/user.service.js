import { findMany } from '#repositories/main.repository.js';
import { users } from '#models/user.model.js';
import { and, eq, not } from 'drizzle-orm';
import { organizations } from '#models/organization.model.js';
import NotFoundException from '#exceptions/notFound.exception.js';

export const listUsersService = async (query = {}, payload) => {
  const { user_id, org_id } = payload;
  return await findMany(
    users,
    and(
      eq(users.org_id, org_id),
      not(eq(users.id, user_id))
    ),
    query.start ?? 0,
    query.end ?? 20,
  );
};

export const isUserLinkedToOrganizationService = async (org_id, user_id) => {
    const user = await findOne(
        users,
        and(
            eq(users.id, user_id),
            eq(users.org_id, org_id),
        )
    );

    if(!user)
        throw new NotFoundException("user was not found with organization passed.");

    return user;
};