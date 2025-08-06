
import { z } from 'zod';

// Update Payment Gateway input schema
export const updatePaymentGatewayInputSchema = z.object({
  id: z.number(),
  is_enabled: z.boolean().optional(),
  config_data: z.string().optional()
});

export type UpdatePaymentGatewayInput = z.infer<typeof updatePaymentGatewayInputSchema>;
