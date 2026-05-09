import BaseException from "./base.exception.js";

export default class InvalidPayloadException extends BaseException {
  constructor(message = 'Payload is invalid to pass.', details = null) {
    super(message, 400, null, cause);
  }
}
