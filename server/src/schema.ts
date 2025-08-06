
import { z } from 'zod';

// Admin schema
export const adminSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string(), // In real app, this would be hashed
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Admin = z.infer<typeof adminSchema>;

// Voucher type schema (the 8 predefined voucher types)
export const voucherTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  duration: z.string(), // e.g., "1 hour", "1 day", "1 week"
  price: z.number(),
  is_enabled: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type VoucherType = z.infer<typeof voucherTypeSchema>;

// Voucher codes schema (actual codes that can be sold)
export const voucherCodeSchema = z.object({
  id: z.number(),
  voucher_type_id: z.number(),
  code: z.string(),
  is_sold: z.boolean(),
  created_at: z.coerce.date()
});

export type VoucherCode = z.infer<typeof voucherCodeSchema>;

// Sales schema
export const saleSchema = z.object({
  id: z.number(),
  voucher_code_id: z.number(),
  voucher_code: z.string(),
  voucher_type_name: z.string(),
  price: z.number(),
  buyer_whatsapp: z.string(),
  sale_date: z.coerce.date(),
  created_at: z.coerce.date()
});

export type Sale = z.infer<typeof saleSchema>;

// Payment gateway config schema
export const paymentGatewayConfigSchema = z.object({
  id: z.number(),
  name: z.string(),
  is_enabled: z.boolean(),
  config_data: z.string(), // JSON string for configuration
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type PaymentGatewayConfig = z.infer<typeof paymentGatewayConfigSchema>;

// Input schemas for authentication
export const loginInputSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export type LoginInput = z.infer<typeof loginInputSchema>;

// Input schema for updating admin credentials
export const updateAdminCredentialsInputSchema = z.object({
  current_username: z.string().min(1),
  current_password: z.string().min(1),
  new_username: z.string().min(1),
  new_password: z.string().min(1)
});

export type UpdateAdminCredentialsInput = z.infer<typeof updateAdminCredentialsInputSchema>;

// Input schema for updating voucher types
export const updateVoucherTypeInputSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  duration: z.string().optional(),
  price: z.number().positive().optional(),
  is_enabled: z.boolean().optional()
});

export type UpdateVoucherTypeInput = z.infer<typeof updateVoucherTypeInputSchema>;

// Input schema for adding voucher codes
export const addVoucherCodesInputSchema = z.object({
  voucher_type_id: z.number(),
  codes: z.array(z.string().min(1))
});

export type AddVoucherCodesInput = z.infer<typeof addVoucherCodesInputSchema>;

// Input schema for purchase
export const purchaseVoucherInputSchema = z.object({
  voucher_type_id: z.number(),
  buyer_whatsapp: z.string().min(1)
});

export type PurchaseVoucherInput = z.infer<typeof purchaseVoucherInputSchema>;

// Input schema for sales reports
export const salesReportInputSchema = z.object({
  start_date: z.string().optional(), // ISO date string
  end_date: z.string().optional(), // ISO date string
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().optional()
});

export type SalesReportInput = z.infer<typeof salesReportInputSchema>;

// Sales report response schema
export const salesReportSchema = z.object({
  total_sales: z.number(),
  total_revenue: z.number(),
  sales_by_voucher_type: z.array(z.object({
    voucher_type_name: z.string(),
    count: z.number(),
    revenue: z.number()
  })),
  daily_sales: z.array(z.object({
    date: z.string(),
    count: z.number(),
    revenue: z.number()
  }))
});

export type SalesReport = z.infer<typeof salesReportSchema>;

// Voucher inventory schema (for admin view)
export const voucherInventorySchema = z.object({
  voucher_type_id: z.number(),
  voucher_type_name: z.string(),
  total_codes: z.number(),
  available_codes: z.number(),
  sold_codes: z.number()
});

export type VoucherInventory = z.infer<typeof voucherInventorySchema>;
