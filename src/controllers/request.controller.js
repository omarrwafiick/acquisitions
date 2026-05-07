import { getRequestByIdService, listRequestsService, submitRequestService } from "#services/request.service.js";
import responseHandler from "#utils/response.js";

export const listRequestsController  = async (req, res, next) => {
  try {
    const data = await listRequestsService(req.body.options, { org_id: req.user.org_id });

    responseHandler(req, res, { message: 'requests was fetched!', data }, 200);
  } catch (error) {
    responseHandler(req, res, error, error.status||400);
  }
};

export const getRequestByIdController = async (req, res, next) => {
  try {
    const data = await getRequestByIdService({ id: req.params.id, org_id: req.user.org_id });

    responseHandler(req, res, { message: 'request was fetched!', data }, 200);
  } catch (error) {
    responseHandler(req, res, error, error.status||400);
  }
};

export const submitRequestController  = async (req, res, next) => {
  try {
    const data = await submitRequestService(req.body, { org_id: req.user.org_id, user_id: req.user.id });

    responseHandler(req, res, { message: 'request was created!', data }, 201);
  } catch (error) {
    responseHandler(req, res, error, error.status||400);
  }
};
