
import { db } from '../db';
import { paymentGatewaysTable, type PaymentGateway } from '../db/schema';
import { type UpdatePaymentGatewayInput } from '../schema';
import { eq } from 'drizzle-orm';

export const updatePaymentGateway = async (input: UpdatePaymentGatewayInput): Promise<PaymentGateway> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof paymentGatewaysTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.is_enabled !== undefined) {
      updateData.is_enabled = input.is_enabled;
    }

    if (input.config_data !== undefined) {
      updateData.config_data = input.config_data;
    }

    // Update payment gateway record
    const result = await db.update(paymentGatewaysTable)
      .set(updateData)
      .where(eq(paymentGatewaysTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Payment gateway with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Payment gateway update failed:', error);
    throw error;
  }
};
