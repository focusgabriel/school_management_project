import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { classes } from './class.model';
import { subjects } from './subject.model';
import { grades } from './grade.model';

export const examTypeEnum = pgEnum('exam_type', [
  'midterm',
  'final',
  'quiz',
  'assignment',
  'project',
  'practical',
  'unit_test',
]);

export const exams = pgTable('exams', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  classId: uuid('class_id').references(() => classes.id),
  subjectId: uuid('subject_id').references(() => subjects.id),
  examDate: timestamp('exam_date').notNull(),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  duration: integer('duration'),
  totalMarks: integer('total_marks').default(100),
  passMarks: integer('pass_marks').default(35),
  instructions: text('instructions'),
  venue: varchar('venue', { length: 200 }),
  invigilatorId: uuid('invigilator_id'),
  academicYear: varchar('academic_year', { length: 20 }),
  term: varchar('term', { length: 50 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const examsRelations = relations(exams, ({ one, many }) => ({
  class: one(classes, {
    fields: [exams.classId],
    references: [classes.id],
  }),
  subject: one(subjects, {
    fields: [exams.subjectId],
    references: [subjects.id],
  }),
  grades: many(grades),
}));