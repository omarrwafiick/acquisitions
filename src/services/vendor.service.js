import {
  create,
  findMany,
  findOne,
  findOneWithJoin,
} from '#repositories/main.repository.js';
import { vendors } from '#models/vendor.mode.js';
import { and, eq, not } from 'drizzle-orm';
import DuplicateException from '#exceptions/duplicate.exception.js';
import NotFoundException from '#exceptions/notFound.exception.js';
import { organizations } from '#models/organization.model.js';
import { createAuditLogService } from './auditLog.service.js';
import { isUserLinkedToOrganizationService } from './user.service.js';
import logger, { logEventObj } from '#config/logger.js';

export const createVendorService = async payload => {
  const { email, name, org_id, user_id } = payload;

  await isUserLinkedToOrganizationService(org_id, user_id);

  const organization = await findOne(
    organizations,
    eq(organizations.id, org_id)
  );

  if (!organization) throw new NotFoundException('Organization was not found.');

  const resourceExists = await findOne(
    vendors,
    and(
      eq(vendors.email, email),
      eq(vendors.org_id, org_id),
      eq(vendors.name, name)
    )
  );

  if (resourceExists) throw new DuplicateException('Vendor already exist');

  const newVendor = await create(vendors, {
    org_id,
    name,
    email,
  });

  await createAuditLogService({
    org_id,
    actor_id: user_id,
    entity_type: 'vendor',
    entity_id: newVendor.id,
    action: 'create_vendor',
    metadata: {},
  });

  logger.info(logEventObj(
      'Create vendor',
      user_id,
      org_id,
      "vendor",
      newVendor.id,
      {
        "vendor":newVendor
      }
    )
  );

  return newVendor;
};

export const listVendorsService = async (query = {}, payload) => {
  const { org_id } = payload;
  return await findMany(
    vendors,
    eq(vendors.org_id, org_id),
    query.start || 0,
    query.end || 20
  );
};

export const getVendorByIdService = async payload => {
  const { id, org_id } = payload;
  return await findOne(
    vendors,
    and(eq(vendors.id, id), eq(vendors.org_id, org_id))
  );
};
