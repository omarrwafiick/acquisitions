import { changeRequestStateService, listPendingApprovalsService } from "#services/approval.service.js";
import { CONSTANTS } from "#services/constants.service.js";
import responseHandler from "#utils/response.js";

export const listPendingApprovalsController = async (req, res, next) => {
  try {
    const data = await listPendingApprovalsService( 
      req.body.options,
      {
        org_id: req.user.org_id,
      }
    );

    responseHandler(req, res, { message: 'pending approvals was found!', data }, 200);
  } catch (error) {
    responseHandler(req, res, error, error.status||400);
  }
};

export const approveRequestController  = async (req, res, next) => {
  try {
    const data = await changeRequestStateService( { 
      requestId: req.params.id,
      approverId: req.user.id,
      org_id: req.user.org_id,
      newStatus: CONSTANTS.REQUEST.STATUS.APPROVED
    });

    responseHandler(req, res, { message: 'request status was changed to approved status!', data }, 200);
  } catch (error) {
    responseHandler(req, res, error, error.status||400);
  }
};

export const rejectRequestController  = async (req, res, next) => {
  try {
    const data = await changeRequestStateService( { 
      requestId: req.params.id,
      approverId: req.user.id,
      org_id: req.user.org_id,
      newStatus: CONSTANTS.REQUEST.STATUS.REJECTED
    });

    responseHandler(req, res, { message: 'request status was changed to reject status!', data }, 200);
  } catch (error) {
    responseHandler(req, res, error, error.status||400);
  }
};
