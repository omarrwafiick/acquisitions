import DuplicateException from '#exceptions/duplicate.exception.js';
import NotFoundException from '#exceptions/notFound.exception.js';
import InvalidPasswordException from '#exceptions/invalidPassword.exception.js';
import { userPassword } from '#utils/security.js';
import logger from '#config/logger.js';
import { create, findOne } from '#repositories/main.repository.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const createUser = async ({ name, email, password, role }) => {
  const existingUser = await findOne(users, eq(users.email, email));

  if (existingUser.length > 0)
    throw new DuplicateException('User already exist');

  const hashedPassword = await userPassword.hash(password);

  const [newUser] = await create(
    users,
    {
      email,
      name,
      password: hashedPassword,
      role,
    }
  );

  logger.info(`new user was created with id: ${newUser.id}`);

  return { 
    id: newUser.id, 
    name: newUser.name, 
    email: newUser.email, 
    role: newUser.role, 
    created_at: newUser.created_at 
  };
};

export const checkUserExistance = async ({ email, password }) => {
  const user = await findOne(users, eq(users.email, email))[0];
  if(!user)
    throw new NotFoundException('User was not found');

  const validPassword = await userPassword.validate(password, user.password);
    
  if(!validPassword)
    throw new InvalidPasswordException();

  return user;
};
