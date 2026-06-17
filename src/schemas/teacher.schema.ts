import { z } from 'zod';

export const createTeacherSchema = z.object({
  userId: z.string().uuid(),
  employeeId: z.string().min(1, 'Employee ID is required'),
  designation: z.string().min(1, 'Designation is required'),
  department: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.number().int().min(0).optional(),
  joiningDate: z.string().datetime(),
  salary: z.number().positive().optional(),
  teacherType: z.enum(['permanent', 'contract', 'substitute', 'part_time']).default('permanent'),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIfsc: z.string().optional(),
  panNumber: z.string().optional(),
  aadharNumber: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  bio: z.string().optional(),
  certifications: z.string().optional(),
});

export const updateTeacherSchema = createTeacherSchema.partial().omit({ userId: true });

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;