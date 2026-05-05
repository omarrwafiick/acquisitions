import DuplicateException from "#exceptions/duplicate.exception.js";
import { organizations } from "#models/organization.model.js";
import { users } from "#models/user.model.js";
import { create, findOne, findOneWithJoin } from "#repositories/main.repository.js";
import { eq, or } from "drizzle-orm";

export const createOrganizationService = async (payload) => {
  const { name, slug } = payload;
  const resourceExists = await findOne(organizations, 
    or(
        eq(organizations.name, name), 
        eq(organizations.slug, slug),
    )
  );

  if(resourceExists)
    throw new DuplicateException('Organization already exist');

  const newOrg = await create(organizations, 
    {
        name,
        slug,
    }
  );

  return { id: newOrg.id }
};

export const getMyOrganizationService = async (payload) => {
    return await findOneWithJoin(
        organizations, 
        users, 
        undefined, 
        eq(users.org_id, organizations.id),
        {
            id: organizations.id,
            name: organizations.name,
            slug: organizations.slug,
            createdAt: organizations.created_at,
        }
    )
};
