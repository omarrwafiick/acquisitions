import z from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().max(255).toLowerCase().trim(),
  slug: z.string().min(3).max(255),
});

