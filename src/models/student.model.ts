import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user.model';
import { classes } from './class.model';
import { enrollments } from './enrollment.model';
import { attendance } from './attendance.model';
import { grades } from './grade.model';

export const bloodGroupEnum = pgEnum('blood_group', [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
]);

export const students = pgTable('students', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  admissionNumber: varchar('admission_number', { length: 50 }).notNull().unique(),
  rollNumber: varchar('roll_number', { length: 50 }),
  admissionDate: timestamp('admission_date').notNull(),
  currentClassId: uuid('current_class_id').references(() => classes.id),
  section: varchar('section', { length: 50 }),
  bloodGroup: varchar('blood_group', { length: 5 }),
  caste: varchar('caste', { length: 100 }),
  religion: varchar('religion', { length: 100 }),
  nationality: varchar('nationality', { length: 100 }),
  motherTongue: varchar('mother_tongue', { length: 50 }),
  fatherName: varchar('father_name', { length: 200 }),
  fatherOccupation: varchar('father_occupation', { length: 200 }),
  fatherPhone: varchar('father_phone', { length: 20 }),
  motherName: varchar('mother_name', { length: 200 }),
  motherOccupation: varchar('mother_occupation', { length: 200 }),
  motherPhone: varchar('mother_phone', { length: 20 }),
  guardianName: varchar('guardian_name', { length: 200 }),
  guardianPhone: varchar('guardian_phone', { length: 20 }),
  guardianRelation: varchar('guardian_relation', { length: 50 }),
  previousSchool: varchar('previous_school', { length: 255 }),
  medicalConditions: text('medical_conditions'),
  allergies: text('allergies'),
  emergencyContactName: varchar('emergency_contact_name', { length: 200 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }),
  emergencyContactRelation: varchar('emergency_contact_relation', { length: 50 }),
  transportMode: varchar('transport_mode', { length: 50 }),
  busRoute: varchar('bus_route', { length: 100 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  currentClass: one(classes, {
    fields: [students.currentClassId],
    references: [classes.id],
  }),
  enrollments: many(enrollments),
  attendance: many(attendance),
  grades: many(grades),
}));