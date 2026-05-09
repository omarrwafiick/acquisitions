import BaseException from "./base.exception.js";

export default class InvalidPasswordException extends BaseException {
  constructor(message = 'Password is invalid.', cause = 'Unknown') {
    super(message, 400, null, cause);
  }
}
