
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { paymentGatewaysTable } from '../db/schema';
import { purchaseVoucher, type PurchaseVoucherInput } from '../handlers/purchase_voucher';
import { eq } from 'drizzle-orm';

const testInput: PurchaseVoucherInput = {
  voucher_type_id: 1,
  buyer_whatsapp: '+1234567890'
};

describe('purchaseVoucher', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should purchase a voucher successfully', async () => {
    // Create test payment gateway (simulating voucher type)
    const gateway = await db.insert(paymentGatewaysTable)
      .values({
        name: 'Test Voucher Type',
        is_enabled: true,
        config_data: '{"price": 25.00}'
      })
      .returning()
      .execute();

    const result = await purchaseVoucher({
      ...testInput,
      voucher_type_id: gateway[0].id
    });

    expect(result.success).toBe(true);
    expect(result.voucher_code).toBeDefined();
    expect(result.voucher_code).toMatch(/^VOUCHER-\d+$/);
    expect(result.sale).toBeDefined();
    expect(result.sale?.price).toBe(25.00);
    expect(result.sale?.buyer_whatsapp).toBe(testInput.buyer_whatsapp);
    expect(result.sale?.voucher_type_name).toBe('Test Voucher Type');
    expect(result.sale?.voucher_code_id).toBe(gateway[0].id);
    expect(result.message).toBe('Voucher purchased successfully');
  });

  it('should return error when voucher type not found', async () => {
    const result = await purchaseVoucher({
      ...testInput,
      voucher_type_id: 999
    });

    expect(result.success).toBe(false);
    expect(result.voucher_code).toBeUndefined();
    expect(result.sale).toBeUndefined();
    expect(result.message).toBe('Voucher type not found');
  });

  it('should generate unique voucher codes', async () => {
    // Create test payment gateway
    const gateway = await db.insert(paymentGatewaysTable)
      .values({
        name: 'Test Voucher Type',
        is_enabled: true,
        config_data: '{"price": 25.00}'
      })
      .returning()
      .execute();

    const result1 = await purchaseVoucher({
      ...testInput,
      voucher_type_id: gateway[0].id
    });

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const result2 = await purchaseVoucher({
      ...testInput,
      voucher_type_id: gateway[0].id
    });

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    expect(result1.voucher_code).not.toBe(result2.voucher_code);
    expect(result1.sale?.id).not.toBe(result2.sale?.id);
  });

  it('should validate input data correctly', async () => {
    // Create test payment gateway
    const gateway = await db.insert(paymentGatewaysTable)
      .values({
        name: 'Test Voucher Type',
        is_enabled: true
      })
      .returning()
      .execute();

    const result = await purchaseVoucher({
      voucher_type_id: gateway[0].id,
      buyer_whatsapp: '+9876543210'
    });

    expect(result.success).toBe(true);
    expect(result.sale?.buyer_whatsapp).toBe('+9876543210');
  });

  it('should handle database queries correctly', async () => {
    // Create multiple payment gateways
    await db.insert(paymentGatewaysTable)
      .values([
        {
          name: 'Gateway 1',
          is_enabled: true
        },
        {
          name: 'Gateway 2',
          is_enabled: false
        }
      ])
      .execute();

    // Query to get the second gateway
    const gateways = await db.select()
      .from(paymentGatewaysTable)
      .where(eq(paymentGatewaysTable.name, 'Gateway 2'))
      .execute();

    expect(gateways).toHaveLength(1);
    expect(gateways[0].name).toBe('Gateway 2');
    expect(gateways[0].is_enabled).toBe(false);

    const result = await purchaseVoucher({
      ...testInput,
      voucher_type_id: gateways[0].id
    });

    expect(result.success).toBe(true);
    expect(result.sale?.voucher_type_name).toBe('Gateway 2');
  });
});
