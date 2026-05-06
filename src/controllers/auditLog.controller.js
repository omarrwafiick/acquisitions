import { listAuditLogsService } from "#services/auditLog.service.js";
import responseHandler from "#utils/response.js";

export const listAuditLogsController = async (req, res, next) => {
   try {
    const data = await listAuditLogsService(
      req.body.options,
      { 
        org_id: req.user.org_id,
      }
    );

    responseHandler(req, res, { message: 'audit logs was found!', data }, 200);
  } catch (error) {
    responseHandler(req, res, error, error.status||400);
  }
};
