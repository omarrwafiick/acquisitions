import { createVendorService, getVendorByIdService, listVendorsService } from '#services/vendor.service.js';
import responseHandler from '#utils/response.js';

export const createVendorController = async (req, res, next) => {
  try {
    const data = await createVendorService(req.data);

    responseHandler(req, res, { message: 'success vendor creation!', data }, 201);
  } catch (error) {
    responseHandler(req, res, error, error.status||400);
  }
};

export const listVendorsController = async (req, res, next) => {
  try {
    const data = await listVendorsService(req.options, req);

    responseHandler(req, res, { message: 'vendors list was found!', data }, 200);
  } catch (error) {
    responseHandler(req, res, error, error.status||400);
  }
};

export const getVendorByIdController = async (req, res, next) => {
  try {
    const data = await getVendorByIdService(req.params.id, req);

    responseHandler(req, res, { message: 'vendor was found!', data }, 200);
  } catch (error) {
    responseHandler(req, res, error, error.status||400);
  }
};
