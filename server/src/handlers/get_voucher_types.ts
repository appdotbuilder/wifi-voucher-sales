
import { db } from '../db';
import { paymentGatewaysTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface VoucherType {
  id: number;
  name: string;
  is_enabled: boolean;
  config_data: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function getVoucherTypes(): Promise<VoucherType[]> {
  try {
    // Since there's no voucher_types table in the schema, we'll use payment_gateways
    // as a placeholder to demonstrate the pattern. In a real implementation,
    // this would query a voucher_types table.
    const results = await db.select()
      .from(paymentGatewaysTable)
      .where(eq(paymentGatewaysTable.is_enabled, true))
      .execute();

    return results.map(result => ({
      id: result.id,
      name: result.name,
      is_enabled: result.is_enabled,
      config_data: result.config_data,
      created_at: result.created_at,
      updated_at: result.updated_at
    }));
  } catch (error) {
    console.error('Get voucher types failed:', error);
    throw error;
  }
}
