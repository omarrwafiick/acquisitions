import { CONSTANTS } from '#services/constants.service.js';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email().max(255).toLowerCase().trim(),
  password: z.string().min(8).max(255),
});

export const registerSchema = z.object({
  email: z.email().max(255).toLowerCase().trim(),
  password: z.string().min(8).max(255),
  name: z.string().min(3).max(255),
  role: z.enum([CONSTANTS.ROLES.MODERATOR]),
  org_id: z.number(),
});

export const addMemberSchema = z.object({
  email: z.email().max(255).toLowerCase().trim(),
  password: z.string().min(8).max(255),
  name: z.string().min(3).max(255),
  role: z.enum([CONSTANTS.ROLES.REQUESTER, CONSTANTS.ROLES.APPROVER]),
  org_id: z.number(),
});
