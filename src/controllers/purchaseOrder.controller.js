import responseHandler from "#utils/response.js";

export const createPurchaseOrderController = async (req, res, next) => {
  next();
};

export const listPurchaseOrdersController = async (req, res, next) => {
  next();
};

export const getPurchaseOrderByIdController = async (req, res, next) => {
  try {
    const data = await getRequestByIdService( { id: req.params.id, org_id: req.user.org_id });

    responseHandler(req, res, { message: 'request was found!', data }, 200);
  } catch (error) {
    responseHandler(req, res, error, error.status||400);
  }
};

export const sendPurchaseOrderController = async (req, res, next) => {
  next();
};

export const completePurchaseOrderController = async (req, res, next) => {
  next();
};
