import responseHandler from '#utils/response.js';
import {
  registerService,
  loginService,
  logoutUser,
} from '#services/auth.service.js';

export const register = addMember => async (req, res, next) => {
  try {
    const data = await registerService(req, res, addMember);

    responseHandler(
      req,
      res,
      { message: 'success account creation', data },
      201
    );
  } catch (error) {
    responseHandler(req, res, error, error.status || 400);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await loginService(req, res);

    responseHandler(
      req,
      res,
      { message: 'success login', data: { user } },
      200
    );
  } catch (error) {
    responseHandler(req, res, error, error.status || 400);
  }
};

export const logout = (req, res, next) => {
  try {
    logoutUser(req, res);

    responseHandler(req, res, { message: 'success logout' }, 200);
  } catch (error) {
    responseHandler(req, res, error, error.status || 400);
  }
};
