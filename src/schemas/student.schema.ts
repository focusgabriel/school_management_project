import { z } from 'zod';

export const createStudentSchema = z.object({
  userId: z.string().uuid(),
  admissionNumber: z.string().min(1, 'Admission number is required'),
  admissionDate: z.string().datetime(),
  currentClassId: z.string().uuid().optional(),
  section: z.string().optional(),
  rollNumber: z.string().optional(),
  bloodGroup: z.string().optional(),
  caste: z.string().optional(),
  religion: z.string().optional(),
  nationality: z.string().optional(),
  motherTongue: z.string().optional(),
  fatherName: z.string().optional(),
  fatherOccupation: z.string().optional(),
  fatherPhone: z.string().optional(),
  motherName: z.string().optional(),
  motherOccupation: z.string().optional(),
  motherPhone: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianRelation: z.string().optional(),
  previousSchool: z.string().optional(),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  transportMode: z.string().optional(),
  busRoute: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.partial().omit({ userId: true });

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;