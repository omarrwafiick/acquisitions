import {
  pgTable,
  serial,
  integer,
  varchar,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { organizations } from '#models/organization.model.js';
import { users } from '#models/user.model.js';

export const audit_logs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),

    org_id: integer('org_id')
      .notNull()
      .references(() => organizations.id),

    actor_id: integer('actor_id')
      .references(() => users.id),

    entity_type: varchar(
      'entity_type',
      { length: 100 }
    ).notNull(),

    entity_id: integer('entity_id')
      .notNull(),

    action: varchar('action', {
      length: 100,
    }).notNull(),

    metadata: jsonb('metadata'),

    created_at: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    orgCreatedIdx: index(
      'audit_org_created_idx'
    ).on(
      table.org_id,
      table.created_at
    ),
  })
);