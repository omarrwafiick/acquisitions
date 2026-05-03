import { db } from '#config/database.js';
import { eq } from 'drizzle-orm';
import { users } from '#models/user.model.js';
import DuplicateException from '#exceptions/duplicate.exception.js';
import NotFoundException from '#exceptions/notFound.exception.js';
import InvalidPasswordException from '#exceptions/invalidPassword.exception.js';
import { userPassword } from '#utils/security.js';
import logger from '#config/logger.js';

export const createUser = async ({ name, email, password }) => {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0)
    throw new DuplicateException('User already exist');

  const hashedPassword = await userPassword.hash(password);

  const [newUser] = await db
    .insert(users)
    .values({
      email,
      name,
      password: hashedPassword,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      created_at: users.created_at,
    });

  logger.info(`new user was created with info: ${newUser}`);

  return newUser;
};

export const checkUserExistance = async ({ email, password }) => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)[0];

  if(!user)
    throw new NotFoundException('User was not found');

  const validPassword = await userPassword.validate(password, user.password);
    
  if(!validPassword)
    throw new InvalidPasswordException();

  return user;
};
