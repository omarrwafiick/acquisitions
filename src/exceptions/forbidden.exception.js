import { cookies } from "#utils/cookies.js";

export default class ForbiddenException extends Error {
  constructor(message = 'You are forbidden to access this resource.', cause = 'Unknown', res = null) {
    super(message, { cause });
    
    if(res)
      cookies.clear(res, "token")

    this.name = 'ForbiddenException';
    this.status = 403;
  }
}
