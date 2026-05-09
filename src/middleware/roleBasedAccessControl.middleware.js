import ForbiddenException from '#exceptions/forbidden.exception.js';
import responseHandler from '#utils/response.js';

const roleBaseAccessControlMiddleware =
  (roles = []) =>
  (req, res, next) => {
    const { role, id, org_id } = req.user;
    try {
      if (!role || !roles.includes(role)) {
        throw new ForbiddenException(
          'Your role is not authorized for this action.',
          'No permission',
          res
        );
      }

      next();
    } catch (error) {
      responseHandler(
        req,
        res,
        {
          error,
          info: {
            userRole: role,
            userOrgId: org_id,
            userId: id,
            method: req.method,
            path: req.path,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
          },
        },
        error.status || 400
      );
    }
  };

export default roleBaseAccessControlMiddleware;
