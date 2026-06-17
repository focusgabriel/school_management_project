import { z } from 'zod';

export const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(100),
  code: z.string().min(1, 'Class code is required').max(50),
  section: z.string().optional(),
  academicYear: z.string().min(1, 'Academic year is required'),
  grade: z.number().int().min(1).max(12).optional(),
  capacity: z.number().int().min(1).default(50),
  classTeacherId: z.string().uuid().optional(),
  classroom: z.string().optional(),
  floor: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateClassSchema = createClassSchema.partial();

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;