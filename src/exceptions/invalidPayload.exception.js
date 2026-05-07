export default class InvalidPayloadException extends Error {
  constructor(message = 'Payload is invalid to pass.', details = null) {
    super(message);

    this.name = 'InvalidPayloadException';
    this.status = 400;
    this.details = details;
  }
}
