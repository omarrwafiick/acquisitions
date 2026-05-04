export default class DuplicateException extends Error {
  constructor(message = 'Duplicates are not allowed.', cause = 'Unknown') {
    super(message, { cause });

    this.name = 'DuplicateException';
    this.status = 400;
  }
}
