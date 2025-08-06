
import { db } from '../db';
import { paymentGatewaysTable } from '../db/schema';

// Define the return type for payment gateway configuration
export type PaymentGatewayConfig = {
  id: number;
  name: string;
  is_enabled: boolean;
  config_data: string | null;
  created_at: Date;
  updated_at: Date;
};

export async function getPaymentGatewayStatus(): Promise<PaymentGatewayConfig[]> {
  try {
    const results = await db.select()
      .from(paymentGatewaysTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch payment gateway status:', error);
    throw error;
  }
}
