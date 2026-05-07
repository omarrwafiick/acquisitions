import { z } from 'zod';

export const submitRequestSchema = z.object({
  title: z.string().min(3).max(255).trim(),

  reason: z.string().max(5000).trim().optional(),

  items: z
    .array(
      z.object({
        name: z.string().min(1).max(255).trim(),

        quantity: z.coerce.number().int().positive(),

        estimatedPrice: z.coerce.number().nonnegative(),
      })
    )
    .min(1),
});

export const updateRequestSchema = z.object({
  updateReason: z.string().max(255).toLowerCase().trim(),
});
