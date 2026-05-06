import logger from "#config/logger.js";
import { getDashboardSummaryService } from "#services/dashboard.service.js";
import responseHandler from "#utils/response.js";

export const getDashboardSummaryController = async (req, res, next) => {
   try {
      logger.debug(`dashboard ${req.user}`)
      const data = await getDashboardSummaryService(req.user.role, req.user.org_id, req.user.id);
  
      responseHandler(req, res, { message: 'dashboard content was fetched!', data }, 200);
    } catch (error) {
      responseHandler(req, res, error, error.status||400);
    }
};
