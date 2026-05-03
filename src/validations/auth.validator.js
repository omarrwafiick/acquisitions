import { z } from 'zod';

const commonAuthSchema = {
    email: z.email().max(255).toLowerCase().trim(),
    password: z.string().min(8).max(255)
};

export const loginSchema = z.object({
    ...commonAuthSchema
});

export const registerSchema = z.object({
    name: z.string().min(3).max(255),
    ...commonAuthSchema
});