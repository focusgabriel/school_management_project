import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  decimal,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { students } from './student.model';
import { classes } from './class.model';

export const feeStatusEnum = pgEnum('fee_status', [
  'pending',
  'paid',
  'overdue',
  'partial',
  'waived',
]);

export const feeTypeEnum = pgEnum('fee_type', [
  'tuition',
  'transport',
  'library',
  'laboratory',
  'sports',
  'other',
]);

export const fees = pgTable('fees', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  classId: uuid('class_id').references(() => classes.id),
  type: varchar('type', { length: 50 }).notNull(),
  description: text('description'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  fine: decimal('fine', { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  amountPaid: decimal('amount_paid', { precision: 10, scale: 2 }).default('0'),
  balance: decimal('balance', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  dueDate: timestamp('due_date').notNull(),
  paidDate: timestamp('paid_date'),
  academicYear: varchar('academic_year', { length: 20 }),
  term: varchar('term', { length: 50 }),
  receiptNumber: varchar('receipt_number', { length: 100 }),
  paymentMode: varchar('payment_mode', { length: 50 }),
  transactionId: varchar('transaction_id', { length: 200 }),
  remarks: text('remarks'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const feesRelations = relations(fees, ({ one }) => ({
  student: one(students, {
    fields: [fees.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [fees.classId],
    references: [classes.id],
  }),
}));