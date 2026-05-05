import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { organizations } from '#models/organization.model.js';

export const vendors = pgTable(
  'vendors',
  {
    id: serial('id').primaryKey(),

    org_id: integer('org_id')
      .notNull()
      .references(() => organizations.id, {
        onDelete: 'cascade',
      }),

    name: varchar('name', {
      length: 255,
    }).notNull(),

    email: varchar('email', {
      length: 255,
    }),

    created_at: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    orgIdx: index('vendors_org_idx')
      .on(table.org_id),
  })
);