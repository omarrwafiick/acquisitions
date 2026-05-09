import BaseException from "./base.exception.js";

export default class JwtTokenCreationException extends BaseException {
  constructor(message = 'Failed to create JWT token', cause = 'Unknown') {
    super(message, 400, null, cause);
  }
}
