import { z } from 'zod';

export const createPurchaseOrderSchema = z.object({
  requestId: z.coerce.number().int().positive(),

  vendorId: z.coerce.number().int().positive(),

  totalAmount: z.coerce.number().positive(),

  status: z.string().max(50).trim().toLowerCase(),
});

export const updatePurchaseOrderSchema = z.object({
  status: z.string().max(50).trim().toLowerCase(),
});
