import { z } from 'zod';

export const ExtractionSchema = z.object({
  supplier: z.string().min(1),
  invoiceNumber: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  currency: z.string().length(3),
  net: z.number(),
  tax: z.number(),
  gross: z.number(),
  iban: z.string().nullable(),
  poNumber: z.string().nullable(),
  lines: z.array(z.object({ description: z.string(), amount: z.number() })),
});
