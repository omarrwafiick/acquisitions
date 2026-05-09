import {
  pgTable,
  serial,
  integer,
  varchar,
  numeric,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { requests } from '#models/request.model.js';
import { vendors } from '#models/vendor.mode.js';
import { users } from '#models/user.model.js';

export const purchase_orders = pgTable(
  'purchase_orders',
  {
    id: serial('id').primaryKey(),

    request_id: integer('request_id')
      .notNull()
      .references(() => requests.id),

    vendor_id: integer('vendor_id')
      .notNull()
      .references(() => vendors.id),

    created_by: integer('created_by')
      .notNull()
      .references(() => users.id),

    status: varchar('status', {
      length: 50,
    }).notNull(),

    total_amount: numeric('total_amount', {
      precision: 12,
      scale: 2,
    }).notNull(),

    created_at: timestamp('created_at').defaultNow().notNull(),

    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    requestIdx: index('po_request_idx').on(table.request_id),

    vendorIdx: index('po_vendor_idx').on(table.vendor_id),
  })
);
