import { listUsersService } from '#services/user.service.js';
import responseHandler from '#utils/response.js';

export const listUsersController = async (req, res, next) => {
   try {
      const data = await listUsersService(
        req.body.options,
        { 
          user_id: req.user.id, 
          org_id: req.user.org_id,
        }
      );
  
      responseHandler(req, res, { message: 'list was found!', data }, 200);
    } catch (error) {
      responseHandler(req, res, error, error.status||400);
    }
};