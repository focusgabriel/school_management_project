import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { classes } from './class.model';
import { teacherSubjects } from './teacher-subject.model';

export const subjectTypeEnum = pgEnum('subject_type', [
  'core',
  'elective',
  'optional',
  'extracurricular',
]);

export const subjects = pgTable('subjects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  type: varchar('type', { length: 50 }).default('core'),
  classId: uuid('class_id').references(() => classes.id),
  description: text('description'),
  creditHours: varchar('credit_hours', { length: 20 }),
  maxMarks: integer('max_marks').default(100),
  passMarks: integer('pass_marks').default(35),
  syllabus: text('syllabus'),
  textbook: varchar('textbook', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  class: one(classes, {
    fields: [subjects.classId],
    references: [classes.id],
  }),
  teacherSubjects: many(teacherSubjects),
}));