import responseHandler from '#utils/response.js';
import validationHandler from '#utils/validation.js';
import { loginSchema, registerSchema } from '#validations/auth.validator.js';
import { createUser, checkUserExistance } from '#services/auth.service.js';
import { jwtToken } from '#utils/security.js';
import { cookies } from '#utils/cookies.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = validationHandler(registerSchema, req.body);

    const newUser = await createUser({ name, email, password });

    const token = await jwtToken.sign(newUser);

    cookies.set(res, 'token', token);

    responseHandler(req, res, { message: 'success account creation', data: { newUser } }, 201);
  } catch (error) {
    responseHandler(req, res, error, error.status||400);
  }
};

export const login = async (req, res, next) => {
  try {
    const { name, email } = validationHandler(loginSchema, req.body);

    const user = await checkUserExistance({ email, password });

    const userHasNoToken = !cookies.get(req, 'token');
    
    if(userHasNoToken){
      const token = await jwtToken.sign(newUser);

      cookies.set(res, 'token', token);
    }

    responseHandler(req, res, { message: 'success login', data: { user } }, 200);
  } catch (error) {
    responseHandler(req, res, error, error.status||400);
  }
};

export const logout = (req, res, next) => {
  try {
    cookies.clear(res, 'token');

    responseHandler(req, res, { message: 'success logout' }, {}, 200);
  } catch (error) {
    responseHandler(req, res, error, error.status||400);
  }
};
