export default class InvalidPasswordException extends Error {
  constructor(message = 'Password is invalid.', cause = 'Unknown') {
    super(message, { cause });

    this.name = 'InvalidPasswordException';
    this.status = 400;
  }
}
