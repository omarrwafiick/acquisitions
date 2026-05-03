export default class NotFoundException extends Error {
  constructor(message = 'Resource/s was not found.', cause = 'Unknown') {
    super(message, { cause });

    this.name = 'NotFoundException';
    this.status = 400;
  }
}
