import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  decimal,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user.model';
import { subjects } from './subject.model';
import { teacherSubjects } from './teacher-subject.model';

export const teacherTypeEnum = pgEnum('teacher_type', [
  'permanent',
  'contract',
  'substitute',
  'part_time',
]);

export const qualificationEnum = pgEnum('qualification', [
  'bachelor',
  'master',
  'phd',
  'diploma',
  'certificate',
]);

export const teachers = pgTable('teachers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  employeeId: varchar('employee_id', { length: 50 }).notNull().unique(),
  designation: varchar('designation', { length: 100 }).notNull(),
  department: varchar('department', { length: 100 }),
  qualification: varchar('qualification', { length: 100 }),
  specialization: varchar('specialization', { length: 200 }),
  experience: integer('experience'),
  joiningDate: timestamp('joining_date').notNull(),
  leavingDate: timestamp('leaving_date'),
  salary: decimal('salary', { precision: 10, scale: 2 }),
  teacherType: varchar('teacher_type', { length: 50 }).default('permanent'),
  bankName: varchar('bank_name', { length: 100 }),
  bankAccountNumber: varchar('bank_account_number', { length: 50 }),
  bankIfsc: varchar('bank_ifsc', { length: 20 }),
  panNumber: varchar('pan_number', { length: 20 }),
  aadharNumber: varchar('aadhar_number', { length: 20 }),
  emergencyContactName: varchar('emergency_contact_name', { length: 200 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }),
  emergencyContactRelation: varchar('emergency_contact_relation', { length: 50 }),
  bio: text('bio'),
  certifications: text('certifications'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, {
    fields: [teachers.userId],
    references: [users.id],
  }),
  teacherSubjects: many(teacherSubjects),
}));