import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { auditLogs } from './audit-log.model';
import { teachers } from './teacher.model';
import { students } from './student.model';

export const userRoleEnum = pgEnum('user_role', [
  'admin',
  'teacher',
  'student',
  'parent',
]);

export const userStatusEnum = pgEnum('user_status', [
  'active',
  'inactive',
  'suspended',
  'pending',
]);

export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  middleName: varchar('middle_name', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  avatar: text('avatar'),
  dateOfBirth: timestamp('date_of_birth'),
  gender: genderEnum('gender'),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  role: userRoleEnum('role').notNull().default('student'),
  status: userStatusEnum('status').notNull().default('pending'),
  emailVerified: boolean('email_verified').default(false),
  lastLogin: timestamp('last_login'),
  refreshToken: text('refresh_token'),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpires: timestamp('password_reset_expires'),
  emailVerificationToken: text('email_verification_token'),
  emailVerificationExpires: timestamp('email_verification_expires'),
  failedLoginAttempts: varchar('failed_login_attempts', { length: 10 }).default('0'),
  lockUntil: timestamp('lock_until'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  students: many(students),
  teachers: many(teachers),
  auditLogs: many(auditLogs),
}));