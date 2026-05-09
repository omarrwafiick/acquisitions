import { z } from 'zod';

export const readListSchema = z.object({
  options: z
    .object({
      start: z.coerce.number().int().nonnegative().optional(),
      end: z.coerce.number().int().nonnegative().optional(),
    })
    .strict()
    .optional(),
}); 