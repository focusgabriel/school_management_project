import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    pgEnum,
    decimal,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { students } from './student.model';
import { exams } from './exam.model';
import { subjects } from './subject.model';

export const gradeStatusEnum = pgEnum('grade_status', [
    'graded',
    'pending',
    'review',
]);

export const grades = pgTable('grades', {
    id: uuid('id').defaultRandom().primaryKey(),
    studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    examId: uuid('exam_id').references(() => exams.id, { onDelete: 'cascade' }),
    subjectId: uuid('subject_id').references(() => subjects.id),
    marksObtained: decimal('marks_obtained', { precision: 5, scale: 2 }),
    totalMarks: decimal('total_marks', { precision: 5, scale: 2 }),
    percentage: decimal('percentage', { precision: 5, scale: 2 }),
    grade: varchar('grade', { length: 10 }),
    gradePoint: decimal('grade_point', { precision: 3, scale: 2 }),
    remarks: text('remarks'),
    gradedBy: uuid('graded_by'),
    gradedAt: timestamp('graded_at'),
    status: varchar('status', { length: 50 }).default('pending'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const gradesRelations = relations(grades, ({ one }) => ({
    student: one(students, {
        fields: [grades.studentId],
        references: [students.id],
    }),
    exam: one(exams, {
        fields: [grades.examId],
        references: [exams.id],
    }),
    subject: one(subjects, {
        fields: [grades.subjectId],
        references: [subjects.id],
    }),
}));