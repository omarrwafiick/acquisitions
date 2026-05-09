import { z } from 'zod';

export const createPurchaseOrderSchema = z.object({
  request_id: z.coerce.number().int().positive(),

  vendor_id: z.coerce.number().int().positive(),

  total_amount: z.coerce.number().positive(),
});

export const updatePurchaseOrderSchema = z.object({
  status: z.string().max(50).trim().toLowerCase(),
});
