import ForbiddenException from '#exceptions/forbidden.exception.js';
import responseHandler from '#utils/response.js';

const roleBaseAccessControlMiddleware = (role) => (req, res, next) => {
  try {
    const userRole = req.user.role;
    if(!userRole || userRole !== role)
      throw new ForbiddenException();
    next();
  } catch (error) {
    responseHandler(req, res, error, error.status || 400);
  }
};

export default roleBaseAccessControlMiddleware;