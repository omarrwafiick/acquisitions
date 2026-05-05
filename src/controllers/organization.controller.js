import logger from "#config/logger.js";
import { createOrganizationService, getMyOrganizationService } from "#services/organization.service.js";
import responseHandler from "#utils/response.js";

export const createOrganization = async (req, res, next) => {
  try {
      const data = await createOrganizationService(req.data);
  
      responseHandler(req, res, { message: 'success organization creation', data }, 201);
    } catch (error) {
      responseHandler(req, res, error, error.status||400);
    }
};

export const getMyOrganization = async (req, res, next) => {
  try {
    const org = await getMyOrganizationService(req.data);

    responseHandler(req, res, { message: 'organization was found!', data: org }, 200);
  } catch (error) {
    responseHandler(req, res, error, error.status||400);
  }
};
