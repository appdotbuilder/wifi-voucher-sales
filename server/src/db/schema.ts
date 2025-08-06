
import { serial, text, pgTable, timestamp, boolean } from 'drizzle-orm/pg-core';

export const paymentGatewaysTable = pgTable('payment_gateways', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  is_enabled: boolean('is_enabled').notNull().default(false),
  config_data: text('config_data'), // Nullable by default, matches Zod schema
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type PaymentGateway = typeof paymentGatewaysTable.$inferSelect; // For SELECT operations
export type NewPaymentGateway = typeof paymentGatewaysTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { paymentGateways: paymentGatewaysTable };
