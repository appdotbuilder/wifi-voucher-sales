
import { serial, text, pgTable, timestamp, numeric, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Admin table for authentication
export const adminsTable = pgTable('admins', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(), // In real app, this would be hashed
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Voucher types table (the 8 predefined voucher types)
export const voucherTypesTable = pgTable('voucher_types', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  duration: text('duration').notNull(), // e.g., "1 hour", "1 day", "1 week"
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  is_enabled: boolean('is_enabled').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Voucher codes table (actual codes that can be sold)
export const voucherCodesTable = pgTable('voucher_codes', {
  id: serial('id').primaryKey(),
  voucher_type_id: integer('voucher_type_id').notNull().references(() => voucherTypesTable.id),
  code: text('code').notNull().unique(),
  is_sold: boolean('is_sold').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Sales table
export const salesTable = pgTable('sales', {
  id: serial('id').primaryKey(),
  voucher_code_id: integer('voucher_code_id').notNull().references(() => voucherCodesTable.id),
  voucher_code: text('voucher_code').notNull(),
  voucher_type_name: text('voucher_type_name').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  buyer_whatsapp: text('buyer_whatsapp').notNull(),
  sale_date: timestamp('sale_date').defaultNow().notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Payment gateway configuration table
export const paymentGatewayConfigsTable = pgTable('payment_gateway_configs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  is_enabled: boolean('is_enabled').default(false).notNull(),
  config_data: text('config_data'), // JSON string for configuration
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const voucherTypesRelations = relations(voucherTypesTable, ({ many }) => ({
  voucherCodes: many(voucherCodesTable)
}));

export const voucherCodesRelations = relations(voucherCodesTable, ({ one, many }) => ({
  voucherType: one(voucherTypesTable, {
    fields: [voucherCodesTable.voucher_type_id],
    references: [voucherTypesTable.id]
  }),
  sales: many(salesTable)
}));

export const salesRelations = relations(salesTable, ({ one }) => ({
  voucherCode: one(voucherCodesTable, {
    fields: [salesTable.voucher_code_id],
    references: [voucherCodesTable.id]
  })
}));

// TypeScript types for the table schemas
export type Admin = typeof adminsTable.$inferSelect;
export type NewAdmin = typeof adminsTable.$inferInsert;
export type VoucherType = typeof voucherTypesTable.$inferSelect;
export type NewVoucherType = typeof voucherTypesTable.$inferInsert;
export type VoucherCode = typeof voucherCodesTable.$inferSelect;
export type NewVoucherCode = typeof voucherCodesTable.$inferInsert;
export type Sale = typeof salesTable.$inferSelect;
export type NewSale = typeof salesTable.$inferInsert;
export type PaymentGatewayConfig = typeof paymentGatewayConfigsTable.$inferSelect;
export type NewPaymentGatewayConfig = typeof paymentGatewayConfigsTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  admins: adminsTable,
  voucherTypes: voucherTypesTable,
  voucherCodes: voucherCodesTable,
  sales: salesTable,
  paymentGatewayConfigs: paymentGatewayConfigsTable
};
