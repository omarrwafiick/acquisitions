import { create, findMany, findManyWithJoin, findOne, findOneWithJoin } from '#repositories/main.repository.js';
import { vendors } from '#models/vendor.mode.js';
import { and, eq, not } from 'drizzle-orm';
import DuplicateException from '#exceptions/duplicate.exception.js';
import NotFoundException from '#exceptions/notFound.exception.js';
import { organizations } from '#models/organization.model.js';

export const createVendorService = async (payload) => {
    const { email, name, org_id } = payload;

    const organization = await findOne(organizations, eq(organizations.id, org_id));

    if (!organization)
        throw new NotFoundException('Organization was not found.');

    const resourceExists = await findOne(
        vendors,
        and(
            eq(vendors.email, email), 
            eq(vendors.org_id, org_id),
            eq(vendors.name, name),
        )
    );

    if(resourceExists)
        throw new DuplicateException('Vendor already exist');

    const newVendor = await create(vendors, {
        org_id,
        name,
        email,
    });

    return newVendor;
};

export const listVendorsService = async (query, { org_id }) => {
    return await findMany(
        vendors,
        eq(vendors.org_id, org_id),
        query.start,
        query.end,
    );
};

export const getVendorByIdService = async (id, { org_id }) => {
    return await findOne(
        vendors, 
        and(
            eq(vendors.id, id),
            eq(vendors.org_id, org_id),
        )
    );
};
