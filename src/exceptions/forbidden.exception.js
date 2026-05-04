export default class ForbiddenException extends Error {
  constructor(message = 'You are forbidden to access this resource.', cause = 'Unknown') {
    super(message, { cause });

    this.name = 'ForbiddenException';
    this.status = 403;
  }
}
