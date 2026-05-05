import { listUsersService } from '#services/user.service.js';
import responseHandler from '#utils/response.js';

export const listUsersController = async (req, res, next) => {
   try {
      const data = await listUsersService(req.options, req);
  
      responseHandler(req, res, { message: 'list was found!', data }, 200);
    } catch (error) {
      responseHandler(req, res, error, error.status||400);
    }
};