import InvalidPayloadException from '#exceptions/invalidPayload.exception.js';
import { formatValidationError } from '#utils/format.js';
import responseHandler from '#utils/response.js';

const schemaValidatorMiddleware = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new InvalidPayloadException(
        'Payload is invalid with the schema.',
        formatValidationError(result.error)
      );
    }
    req.data = result.data;
    next();
  } catch (error) {
    responseHandler(req, res, error, error.status || 400);
  }
};
export default schemaValidatorMiddleware;