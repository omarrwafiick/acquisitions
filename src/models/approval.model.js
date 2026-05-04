import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const approvals = pgTable(
  'approvals',
  {
    id: serial('id').primaryKey(),

    request_id: integer('request_id')
      .notNull()
      .references(() => requests.id, {
        onDelete: 'cascade',
      }),

    approver_id: integer('approver_id')
      .notNull()
      .references(() => users.id),

    status: varchar('status', {
      length: 50,
    }).notNull(),

    comment: text('comment'),

    decided_at: timestamp('decided_at')
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    requestIdx: index('approvals_request_idx')
      .on(table.request_id),

    approverIdx: index(
      'approvals_approver_idx'
    ).on(table.approver_id),
  })
);