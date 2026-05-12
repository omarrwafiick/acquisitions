import { getDashboardSummaryService } from '#services/dashboard.service.js';
import responseHandler from '#utils/response.js';

export const getDashboardSummaryController = async (req, res, next) => {
  try {
    const data = await getDashboardSummaryService({
      role: req.user.role,
      org_id: req.user.org_id,
      user_id: req.user.id,
    });

    responseHandler(
      req,
      res,
      { message: 'dashboard content was fetched!', data },
      200
    );
  } catch (error) {
    responseHandler(req, res, error, error.status || 400);
  }
};
