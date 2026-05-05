import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { organizations } from '#models/organization.model.js';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),

    org_id: integer('org_id')
      .notNull()
      .references(() => organizations.id, {
        onDelete: 'cascade',
      }),

    name: varchar('name', { length: 255 }).notNull(),

    email: varchar('email', { length: 255 }).notNull(),

    password: varchar('password', {
      length: 255,
    }).notNull(),

    role: varchar('role', {
      length: 50,
    }).notNull(),

    created_at: timestamp('created_at')
      .defaultNow()
      .notNull(),

    updated_at: timestamp('updated_at')
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx')
      .on(table.email),

    orgIdx: index('users_org_id_idx')
      .on(table.org_id),
  })
);