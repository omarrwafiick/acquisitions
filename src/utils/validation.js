import InvalidPayloadException from '#exceptions/invalidPayload.exception.js';
import formatValidationError from '#utils/format.js';

function validationHandler(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new InvalidPayloadException(
      'Payload is invalid with the schema.',
      formatValidationError(result.error)
    );
  }
  return result.data;
}

export default validationHandler;
