import { getRequestByIdService } from "#services/request.service.js";
import responseHandler from "#utils/response.js";

export const listRequestsController  = async (req, res, next) => {
  next();
};

export const getRequestByIdController = async (req, res, next) => {
  try {
    const data = await getRequestByIdService( { id: req.params.id, org_id: req.user.org_id });

    responseHandler(req, res, { message: 'request was found!', data }, 200);
  } catch (error) {
    responseHandler(req, res, error, error.status||400);
  }
};

export const submitRequestController  = async (req, res, next) => {
  next();
};
