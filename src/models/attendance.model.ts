import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  text,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { students } from './student.model';
import { classes } from './class.model';

export const attendanceStatusEnum = pgEnum('attendance_status', [
  'present',
  'absent',
  'late',
  'excused',
  'half_day',
]);

export const attendance = pgTable('attendance', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  classId: uuid('class_id').references(() => classes.id),
  date: timestamp('date').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('present'),
  checkInTime: timestamp('check_in_time'),
  checkOutTime: timestamp('check_out_time'),
  remarks: text('remarks'),
  markedBy: uuid('marked_by'),
  subjectId: uuid('subject_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [attendance.classId],
    references: [classes.id],
  }),
}));