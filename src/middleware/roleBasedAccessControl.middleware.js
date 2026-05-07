import ForbiddenException from '#exceptions/forbidden.exception.js';
import responseHandler from '#utils/response.js';

const roleBaseAccessControlMiddleware =
  (roles = []) =>
    (req, res, next) => {
      try {
        const userRole = req.user.role;

        if (!userRole || !roles.includes(userRole)) {
          throw new ForbiddenException(
            'Your role is not authorized for this action.',
            'No permission',
            res
          );
        }

        next();
      } catch (error) {
        responseHandler(req, res, error, error.status || 400);
      }
    };

export default roleBaseAccessControlMiddleware;
