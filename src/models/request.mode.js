import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const requests = pgTable(
  'requests',
  {
    id: serial('id').primaryKey(),

    org_id: integer('org_id')
      .notNull()
      .references(() => organizations.id, {
        onDelete: 'cascade',
      }),

    created_by: integer('created_by')
      .notNull()
      .references(() => users.id),

    title: varchar('title', {
      length: 255,
    }).notNull(),

    reason: text('reason'),

    status: varchar('status', {
      length: 50,
    }).notNull(),

    created_at: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    orgIdx: index('requests_org_idx')
      .on(table.org_id),

    creatorIdx: index('requests_creator_idx')
      .on(table.created_by),

    statusIdx: index('requests_status_idx')
      .on(table.status),
  })
);