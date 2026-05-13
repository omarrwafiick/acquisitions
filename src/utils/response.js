import logger from '#config/logger.js';
import { formatError } from './format.js';

function responseHandler(req, res, payload = {}, status = 200) {
  const err =
    payload instanceof Error
      ? payload
      : payload?.error instanceof Error
        ? payload.error
        : null;

  const isError = !!err;

  const responseBody = isError
    ? {
      error: {
        name: err.name,
        message: err.message,
        details: payload.details ?? null,
      },
    }
    : payload;

  const logBody = {
    ...(isError
      ? {
        error: {
          name: err.name,
          message: err.message,
          status: err.status,
          details: err.details ?? null,
        },
      }
      : { data: payload }),

    info: {
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    },
  };

  logger[status >= 400 ? 'error' : 'info'](JSON.stringify(logBody));

  return res.status(status).json(responseBody);
}

export default responseHandler;
