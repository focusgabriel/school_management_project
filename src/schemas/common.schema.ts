import { z } from 'zod';

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

export const searchSchema = z.object({
  query: z.string().min(1).optional(),
  filters: z.record(z.string()).optional(),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

export type UUIDParam = z.infer<typeof uuidParamSchema>;
export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;