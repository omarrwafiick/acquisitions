import { cookies } from '#utils/cookies.js';
import JwtTokenAuthenticationException from '#exceptions/JwtTokenAuthentication.exception.js';
import { jwtToken } from '#utils/security.js';
import responseHandler from '#utils/response.js';
import logger from '#config/logger.js';

const authenticationMiddleware = (req, res, next) => {
  try {
    const token = cookies.get(req, 'token');
    if (!token) throw new JwtTokenAuthenticationException();

    req.user = jwtToken.verify(token);
    next();
  } catch (error) {
    responseHandler(req, res, error, error.status || 400);
  }
};

export default authenticationMiddleware;
