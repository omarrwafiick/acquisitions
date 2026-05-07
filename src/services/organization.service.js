import DuplicateException from '#exceptions/duplicate.exception.js';
import { organizations } from '#models/organization.model.js';
import { users } from '#models/user.model.js';
import {
  create,
  findOne,
  findOneWithJoin,
} from '#repositories/main.repository.js';
import { eq, or } from 'drizzle-orm';
import logger, { logEventObj } from '#config/logger.js';

export const createOrganizationService = async payload => {
  const { name, slug } = payload;
  const resourceExists = await findOne(
    organizations,
    or(eq(organizations.name, name), eq(organizations.slug, slug))
  );

  if (resourceExists)
    throw new DuplicateException('Organization already exist');

  const newOrg = await create(organizations, {
    name,
    slug,
  });

  logger.info(logEventObj(
      "Create organization",
      "UNKNOWN",
      newOrg.id,
      "Organization",
      newOrg.id
    )
  );
  return { id: newOrg.id };
};

export const getMyOrganizationService = async payload => {
  const { org_id } = payload;
  return await findOne(organizations, eq(organizations.id, org_id));
};
