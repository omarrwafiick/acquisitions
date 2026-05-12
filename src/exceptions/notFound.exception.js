import BaseException from './base.exception.js';

export default class NotFoundException extends BaseException {
  constructor(message = 'Resource/s was not found.', cause = 'Unknown') {
    super(message, 404, null, cause);
  }
}
