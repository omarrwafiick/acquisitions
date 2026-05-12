import BaseException from './base.exception.js';

export default class JwtTokenAuthenticationException extends BaseException {
  constructor(message = 'Failed to authenticate JWT token', cause = 'Unknown') {
    super(message, 401, null, cause);
  }
}
