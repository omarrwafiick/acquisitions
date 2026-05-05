import logger from '#config/logger.js';
import { errorFormater } from './format';

function responseHandler(req, res, data = {}, status = 200) {
  if (status >= 400) {
    logger.error(data);
  } else {
    logger.info(data);
  }
  if(data instanceof Error)
    data = errorFormater(data)
  res.status(status).json(data);
}

export default responseHandler;
