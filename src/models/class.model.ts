import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { teachers } from './teacher.model';
import { students } from './student.model';
import { subjects } from './subject.model';

export const classStatusEnum = pgEnum('class_status', [
  'active',
  'inactive',
  'archived',
]);

export const classes = pgTable('classes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  section: varchar('section', { length: 50 }),
  academicYear: varchar('academic_year', { length: 20 }).notNull(),
  grade: integer('grade'),
  capacity: integer('capacity').default(50),
  currentStrength: integer('current_strength').default(0),
  classTeacherId: uuid('class_teacher_id').references(() => teachers.id),
  classroom: varchar('classroom', { length: 100 }),
  floor: varchar('floor', { length: 50 }),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('active'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const classesRelations = relations(classes, ({ one, many }) => ({
  classTeacher: one(teachers, {
    fields: [classes.classTeacherId],
    references: [teachers.id],
  }),
  students: many(students),
  subjects: many(subjects),
}));