import logger from '#config/logger.js';
import InvalidPayloadException from '#exceptions/invalidPayload.exception.js';
import { formatValidationError } from '#utils/format.js';
import responseHandler from '#utils/response.js';

const schemaValidatorMiddleware = schema => (req, res, next) => {
  try {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new InvalidPayloadException(
        'Payload is invalid with the schema.',
        'validation error',
        formatValidationError(result.error)
      );
    }
    req.body = result.data;
    next();
  } catch (error) {
    responseHandler(req, res, error, error.status || 400);
  }
};
export default schemaValidatorMiddleware;
