import DuplicateException from '#exceptions/duplicate.exception.js';
import NotFoundException from '#exceptions/notFound.exception.js';
import ForbiddenException from '#exceptions/forbidden.exception.js';
import InvalidPasswordException from '#exceptions/invalidPassword.exception.js';
import { userPassword } from '#utils/security.js';
import logger from '#config/logger.js';
import { create, findOne, findOneWithJoin } from '#repositories/main.repository.js';
import { users } from '#models/user.model.js';
import { organizations } from '#models/organization.model.js';
import { and, eq, or } from 'drizzle-orm';
import { jwtToken } from '#utils/security.js';
import { cookies } from '#utils/cookies.js';
import { CONSTANTS } from './constants.service.js';

export const createUser = async (req, res, addMember) => {
  const { name, email, password, role, org_id } = req.body;
  
  const existingUser = await findOne(users, eq(users.email, email));

  if (existingUser)
    throw new DuplicateException('User already exist');

  const organization = await findOne(organizations, eq(organizations.id, org_id));

  if (!organization)
    throw new NotFoundException('Organization was not found.');

  if(role === CONSTANTS.ROLES.MODERATOR)
    await isOrganizationHasModerator({ org_id });

  const hashedPassword = await userPassword.hash(password);

  const newUser = await create(
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
  
  if(!addMember){
    const token = await jwtToken.sign(newUser);

    cookies.set(res, 'token', token);
  }
  
  return mapUserInfo(newUser);
};

const isOrganizationHasModerator = async ({ org_id }) => {
  const organizationHasModerator = await findOneWithJoin(
    organizations,
    users,

    and(
      eq(organizations.id, org_id),
      eq(users.role, CONSTANTS.ROLES.MODERATOR)
    ),

    eq(users.org_id, organizations.id)
  );

  if (organizationHasModerator)
    throw new ForbiddenException('Organization has already a moderator.');

  return;
}

export const checkUserExistance = async (req, res) => {
  const { email, password } = req.body;

  const user = await findOne(users, eq(users.email, email));

  if(!user)
    throw new NotFoundException('User was not found');

  const validPassword = await userPassword.validate(password, user.password);
    
  if(!validPassword)
    throw new InvalidPasswordException();

  const userHasNoToken = !cookies.get(req, 'token');
  
  if(userHasNoToken){
    const token = await jwtToken.sign(user);

    cookies.set(res, 'token', token);
  }

  return mapUserInfo(user);
};

const mapUserInfo = (user) => {
  return { 
    data: {
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      org_id: user.org_id,
      created_at: user.created_at,
    },
  };
}

export const logoutUser = (res) => {
  cookies.clear(res, 'token');
  return;
}
