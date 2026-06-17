import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  time,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { classes } from './class.model';
import { subjects } from './subject.model';
import { teachers } from './teacher.model';

export const dayOfWeekEnum = pgEnum('day_of_week', [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);

export const timetable = pgTable('timetable', {
  id: uuid('id').defaultRandom().primaryKey(),
  classId: uuid('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  subjectId: uuid('subject_id').references(() => subjects.id),
  teacherId: uuid('teacher_id').references(() => teachers.id),
  dayOfWeek: varchar('day_of_week', { length: 20 }).notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  room: varchar('room', { length: 100 }),
  period: integer('period'),
  academicYear: varchar('academic_year', { length: 20 }),
  term: varchar('term', { length: 50 }),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const timetableRelations = relations(timetable, ({ one }) => ({
  class: one(classes, {
    fields: [timetable.classId],
    references: [classes.id],
  }),
  subject: one(subjects, {
    fields: [timetable.subjectId],
    references: [subjects.id],
  }),
  teacher: one(teachers, {
    fields: [timetable.teacherId],
    references: [teachers.id],
  }),
}));