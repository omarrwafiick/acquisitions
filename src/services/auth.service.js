import DuplicateException from '#exceptions/duplicate.exception.js';
import NotFoundException from '#exceptions/notFound.exception.js';
import ForbiddenException from '#exceptions/forbidden.exception.js';
import InvalidPasswordException from '#exceptions/invalidPassword.exception.js';
import { userPassword } from '#utils/security.js';
import logger, { logEventObj } from '#config/logger.js';
import {
  create,
  findOne,
  findOneWithJoin,
} from '#repositories/main.repository.js';
import { users } from '#models/user.model.js';
import { organizations } from '#models/organization.model.js';
import { and, eq, or } from 'drizzle-orm';
import { jwtToken } from '#utils/security.js';
import { cookies } from '#utils/cookies.js';
import { CONSTANTS } from './constants.service.js';
import { vendors } from '#models/vendor.mode.js';

export const createUser = async (req, res, addMember) => {
  const { name, email, password, role, org_id } = req.body;

  const [existingUser, existingVendor] = await Promise.all([
    findOne(users, eq(users.email, email)),
    findOne(vendors, eq(vendors.email, email)),
  ]);

  if (existingUser || existingVendor)
    throw new DuplicateException('User with same credits is already exists.');

  const organization = await findOne(
    organizations,
    eq(organizations.id, org_id)
  );

  if (!organization) 
    throw new NotFoundException('Organization was not found.');

  if (role === CONSTANTS.ROLES.MODERATOR)
    await isOrganizationHasModerator({ org_id, req });

  const hashedPassword = await userPassword.hash(password);

  const newUser = await create(users, {
    email,
    name,
    password: hashedPassword,
    role,
    org_id,
  });

  logger.info(
    logEventObj(
      'Account creation',
      newUser.id??'Unknown',
      org_id,
      'register',
      newUser.id,
      {
        email,
        role,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      }
    )
  );

  if (!addMember) {
    logger.info(
      logEventObj(
        'Grant JWT while register new account',
        newUser.id,
        org_id,
        'JWT creation',
        newUser.id,
        {
          method: req.method,
          path: req.path,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        }
      )
    );
    const token = await jwtToken.sign(newUser);

    cookies.set(res, 'token', token);
  }

  return mapUserInfo(newUser);
};

export const checkUserExistance = async (req, res) => {
  const { email, password } = req.body;

  const user = await findOne(users, eq(users.email, email));

  if (!user) {
    failedLoginAttemptLog(req, user, 'Invalid Email');
    throw new NotFoundException('User was not found');
  }

  const validPassword = await userPassword.validate(password, user.password);

  if (!validPassword) {
    failedLoginAttemptLog(req, user, 'Invalid Password');
    throw new InvalidPasswordException();
  }

  const userHasNoToken = !cookies.get(req, 'token');

  if (userHasNoToken) {
    logger.info(
      logEventObj(
        'Grant JWT while register new account',
        user.id,
        user.org_id,
        'JWT creation',
        user.id,
        {
          method: req.method,
          path: req.path,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        }
      )
    );

    const token = await jwtToken.sign(user);

    cookies.set(res, 'token', token);
  }

  return mapUserInfo(user);
};

export const logoutUser = (req, res) => {
  cookies.clear(res, 'token');

  logger.info(
    logEventObj(
      'User logout',
      req.user.id,
      req.user.org_id,
      'Users table',
      req.user.id,
      {
        email: req.user.email,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      }
    )
  );

  return;
};

const isOrganizationHasModerator = async ({ org_id, req }) => {
  const organizationHasModerator = await findOneWithJoin(
    organizations,
    users,

    and(
      eq(organizations.id, org_id),
      eq(users.role, CONSTANTS.ROLES.MODERATOR)
    ),

    eq(users.org_id, organizations.id)
  );

  if (organizationHasModerator) {
    logger.info(
      logEventObj(
        'Attempt to create new moderator to organization already has onw',
        'UNKNOWN',
        org_id??'Unknown',
        'Business rule violation',
        org_id,
        {
          method: req.method,
          path: req.path,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        }
      )
    );

    throw new ForbiddenException('Organization has already a moderator.');
  }

  return;
};

const failedLoginAttemptLog = (req, user, reason) => {
  logger.info(
    logEventObj(
      'Login failed',
      user?.id ?? 'UNKNOWN',
      user?.org_id ?? 'UNKNOWN',
      reason,
      user?.id ?? 'UNKNOWN',
      {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      }
    )
  );
};

const mapUserInfo = user => {
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
};
