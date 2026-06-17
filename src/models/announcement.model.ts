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
import { users } from './user.model';


export const announcementPriorityEnum = pgEnum('announcement_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

export const announcementTypeEnum = pgEnum('announcement_type', [
  'general',
  'academic',
  'event',
  'holiday',
  'emergency',
]);

export const announcements = pgTable('announcements', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 50 }).default('general'),
  priority: varchar('priority', { length: 50 }).default('medium'),
  targetAudience: varchar('target_audience', { length: 100 }),
  targetClassId: uuid('target_class_id'),
  publishedBy: uuid('published_by').references(() => users.id),
  publishedAt: timestamp('published_at'),
  expiresAt: timestamp('expires_at'),
  isPublished: boolean('is_published').default(false),
  isImportant: boolean('is_important').default(false),
  attachments: text('attachments'),
  views: varchar('views', { length: 10 }).default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const announcementsRelations = relations(announcements, ({ one }) => ({
  publisher: one(users, {
    fields: [announcements.publishedBy],
    references: [users.id],
  }),
}));