export default class BaseException extends Error {
  constructor(
    message = 'Server Error',
    status = 500,
    details = null,
    cause = 'Unknown'
  ) {
    super(message, { cause });

    this.name = new.target.name;

    this.status = status;

    this.details = details;

    Object.setPrototypeOf(
      this,
      new.target.prototype
    );
  }
}