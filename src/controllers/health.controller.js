import { getAppHealthService } from '#src/services/appHealth.service.js';
import responseHandler from '#utils/response.js';

export const getAppHealthController = async (req, res, next) => {
  try {
    const data = await getAppHealthService();

    responseHandler(
      req,
      res,
      { ...data },
      200
    );
  } catch (error) {
    responseHandler(req, res, error, error.status || 400);
  }
};

export const pingAppHealthController = async (req, res, next) => {
    responseHandler(req, res, { message: 'API is running' }, 200);
};
