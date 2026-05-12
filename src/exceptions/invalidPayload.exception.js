import BaseException from './base.exception.js';

export default class InvalidPayloadException extends BaseException {
  constructor(
    message = 'Payload is invalid to pass.',
    cause = 'Unknown',
    details = null
  ) {
    super(message, 400, null, cause);
    this.details = details;
  }
}
