import { cookies } from '#utils/cookies.js';
import JwtTokenAuthenticationException from '#exceptions/JwtTokenAuthentication.exception.js';
import { jwtToken } from '#utils/security.js';
import responseHandler from '#utils/response.js';
import logger from '#config/logger.js';import {
  arcjetClients,
} from "#config/arcjet.js";

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || "guest";
    req.userId = req.user?.id || req.ip;
    
    const client = arcjetClients[role] || arcjetClients.guest;

    const { message } = mapRoleToMessage(role);

    const decision = await client.protect(req, {
      userId: req.user?.id || req.ip,
    });

    securityDecisionTree(req, res, next, decision, message);
  } catch (error) {
    responseHandler(
      req,
      res,
      {
        error,
        info: {
          source: 'ARCJET_SECURITY_EXCEPTION',
          method: req.method,
          path: req.path,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        },
      },
      error.status || 500
    );
  }
};

const mapRoleToMessage = (role) => {
  let message;
    switch (role) {
    case 'admin':
      message = 'Admin rate limit exceeded';
      break;
    case 'requester':
      message = 'Requester rate limit exceeded';
      break;
    case 'approver':
      message = 'Approver rate limit exceeded';
      break;
    default:
      message = 'Guest rate limit exceeded';
  }
  return { message }; 
};

const securityDecisionTree = async (req, res, next, decision, message) => {
  if (decision.isDenied() && decision.reason.isBot()) {
    responseHandler(
      req,
      res,
      {
        error: new Error('Automated traffic detected'),
        message,
      },
      403
    );
  } else if (decision.isDenied() && decision.reason.isShield()) {
    responseHandler(
      req,
      res,
      {
        error: new Error('Shield protection triggered'),
        message,
      },
      403
    );
  } else if (decision.isDenied() && decision.reason.isRateLimit()) {
    responseHandler(
      req,
      res,
      {
        error: new Error('Rate limit exceeded'),
        message,
      },
      429
    );
  } else {
    next();
  }
};

export default securityMiddleware;
