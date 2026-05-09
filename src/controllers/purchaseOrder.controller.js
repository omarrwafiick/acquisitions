import {
  completePurchaseOrderService,
  createPurchaseOrderService,
  getPurchaseOrderByIdService,
  listPurchaseOrdersService,
  sendPurchaseOrderService,
} from '#services/purchaseOrder.service.js';
import responseHandler from '#utils/response.js';

export const createPurchaseOrderController = async (req, res, next) => {
  try {
    const data = await createPurchaseOrderService({
      ...req.body,
      user_id: req.user.id,
      org_id: req.user.org_id,
    });

    responseHandler(
      req,
      res,
      { message: 'new purchase order was created!', data },
      201
    );
  } catch (error) {
    responseHandler(req, res, error, error.status || 400);
  }
};

export const listPurchaseOrdersController = async (req, res, next) => {
  try {
    const data = await listPurchaseOrdersService(req.body.options, {
      org_id: req.user.org_id,
    });

    responseHandler(
      req,
      res,
      { message: 'purchase orders list was found!', data },
      200
    );
  } catch (error) {
    responseHandler(req, res, error, error.status || 400);
  }
};

export const getPurchaseOrderByIdController = async (req, res, next) => {
  try {
    const data = await getPurchaseOrderByIdService({
      id: req.params.id,
      org_id: req.user.org_id,
    });

    responseHandler(
      req,
      res,
      { message: 'purchase orders list was found!', data },
      200
    );
  } catch (error) {
    responseHandler(req, res, error, error.status || 400);
  }
};

export const sendPurchaseOrderController = async (req, res, next) => {
  try {
    const data = await sendPurchaseOrderService({
      purchase_order_id: req.params.id,
      org_id: req.user.org_id,
      user_id: req.user.id,
    });

    responseHandler(
      req,
      res,
      { message: 'purchase orders was sent!', data },
      200
    );
  } catch (error) {
    responseHandler(req, res, error, error.status || 400);
  }
};

export const completePurchaseOrderController = async (req, res, next) => {
  try {
    const data = await completePurchaseOrderService({
      purchase_order_id: req.params.id,
      org_id: req.user.org_id,
      user_id: req.user.id,
    });

    responseHandler(
      req,
      res,
      { message: 'purchase orders was completed!', data },
      200
    );
  } catch (error) {
    responseHandler(req, res, error, error.status || 400);
  }
};
