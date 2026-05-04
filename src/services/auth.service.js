import DuplicateException from '#exceptions/duplicate.exception.js';
import NotFoundException from '#exceptions/notFound.exception.js';
import InvalidPasswordException from '#exceptions/invalidPassword.exception.js';
import { userPassword } from '#utils/security.js';
import logger from '#config/logger.js';
import { create, findOne } from '#repositories/main.repository.js';
import { users } from '#models/user.model.js';
import { organizations } from '#models/organization.model.js';
import { eq } from 'drizzle-orm';
import { jwtToken } from '#utils/security.js';
import { cookies } from '#utils/cookies.js';

export const createUser = async (data) => {
  const { name, email, password, role, org_id } = data;
  
  const existingUser = await findOne(users, eq(users.email, email));

  if (existingUser.length > 0)
    throw new DuplicateException('User already exist');

  const organization = await findOne(organizations, eq(organizations.id, org_id));

  if (organization.length === 0)
    throw new NotFoundException('Organization was not found.');

  const hashedPassword = await userPassword.hash(password);

  const [newUser] = await create(
    users,
    {
      email,
      name,
      password: hashedPassword,
      role,
      org_id,
    }
  );

  logger.info(`new user was created with id: ${newUser.id}`);
  
  const token = await jwtToken.sign(newUser);

  cookies.set(res, 'token', token);
  
  return { 
    user: {
      id: newUser.id, 
      name, 
      email, 
      role: newUser.role,
      org_id,
      created_at: newUser.created_at,
    },
  };
};

export const checkUserExistance = async (data) => {
  const { email, password } = data;

  const user = await findOne(users, eq(users.email, email))[0];

  if(!user)
    throw new NotFoundException('User was not found');

  const validPassword = await userPassword.validate(password, user.password);
    
  if(!validPassword)
    throw new InvalidPasswordException();

  const userHasNoToken = !cookies.get(req, 'token');
  
  if(userHasNoToken){
    const token = await jwtToken.sign(newUser);

    cookies.set(res, 'token', token);
  }

  return user;
};

export const logoutUser = (res) => {
  cookies.clear(res, 'token');
  return;
}
