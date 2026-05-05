import responseHandler from '#utils/response.js';
import { organizations } from '#models/organization.model.js';
import { findOne } from '#repositories/main.repository.js';
import { and, eq } from 'drizzle-orm';
import ForbiddenException from '#exceptions/forbidden.exception.js';

const isMyOrganizationMiddleware = async (req, res, next) => {
  try {
    const myOrganization = await findOne(
        organizations, 
        and(
          eq(organizations.id, req.user.org_id),
          eq(organizations.id, req.body.org_id||req.data.org_id),
        )
    )
    if(!myOrganization)
      throw new ForbiddenException("Organization is not linked to you.");
    
    next();
  } catch (error) {
    responseHandler(req, res, error, error.status || 400);
  }
};

export default isMyOrganizationMiddleware;