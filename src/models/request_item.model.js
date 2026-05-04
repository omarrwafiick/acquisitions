import {
  pgTable,
  serial,
  varchar,
  integer,
  numeric,
  index,
} from 'drizzle-orm/pg-core';

export const request_items = pgTable(
  'request_items',
  {
    id: serial('id').primaryKey(),

    request_id: integer('request_id')
      .notNull()
      .references(() => requests.id, {
        onDelete: 'cascade',
      }),

    name: varchar('name', {
      length: 255,
    }).notNull(),

    quantity: integer('quantity')
      .notNull(),

    estimated_price: numeric(
      'estimated_price',
      {
        precision: 12,
        scale: 2,
      }
    ),
  },
  (table) => ({
    requestIdx: index(
      'request_items_request_idx'
    ).on(table.request_id),
  })
);