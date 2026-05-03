import logger from "#config/logger.js";

function responseHandler(req, res, message={}, status=200){
    if(status >= 400){
        logger.error(message);
    }else{
        logger.info(message);
    }
    res.status(status).json(message);
}

export default responseHandler;