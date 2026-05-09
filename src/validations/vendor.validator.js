import z from 'zod';

export const createVendorSchema = z.object({
  name: z.string().max(255).toLowerCase().trim(),
  email: z.email().max(255).toLowerCase().trim(),
  org_id: z.number(),
});
