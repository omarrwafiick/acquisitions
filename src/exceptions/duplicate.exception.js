import BaseException from "./base.exception.js";

export default class DuplicateException extends BaseException {
  constructor(message = 'Duplicates are not allowed.', cause = 'Unknown') {
    super(message, 409, null, cause);
  }
}
