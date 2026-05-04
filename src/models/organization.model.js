import {
  pgTable,
  serial,
  varchar,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const organizations = pgTable(
  'organizations',
  {
    id: serial('id').primaryKey(),

    name: varchar('name', { length: 255 }).notNull(),

    slug: varchar('slug', { length: 255 }).notNull(),

    created_at: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('organizations_slug_idx')
      .on(table.slug),
  })
);