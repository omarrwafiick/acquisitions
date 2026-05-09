import { cookies } from '#utils/cookies.js';
import BaseException from './base.exception.js';

export default class ForbiddenException extends BaseException {
  constructor(
    message = 'You are forbidden to access this resource.',
    cause = 'Unknown',
    res = null
  ) {
    super(message, 403, null, cause);

    if (res) cookies.clear(res, 'token');
  }
}
