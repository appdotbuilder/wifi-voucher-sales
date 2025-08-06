
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { paymentGatewaysTable } from '../db/schema';
import { getVoucherTypes } from '../handlers/get_voucher_types';

describe('getVoucherTypes', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return enabled voucher types', async () => {
    // Create test data - using payment gateways table as placeholder
    await db.insert(paymentGatewaysTable)
      .values([
        {
          name: 'Enabled Voucher Type',
          is_enabled: true,
          config_data: '{"discount": 10}'
        },
        {
          name: 'Disabled Voucher Type',
          is_enabled: false,
          config_data: '{"discount": 20}'
        }
      ])
      .execute();

    const result = await getVoucherTypes();

    // Should only return enabled voucher types
    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Enabled Voucher Type');
    expect(result[0].is_enabled).toBe(true);
    expect(result[0].config_data).toEqual('{"discount": 10}');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return empty array when no enabled voucher types exist', async () => {
    // Create only disabled voucher type
    await db.insert(paymentGatewaysTable)
      .values({
        name: 'Disabled Voucher Type',
        is_enabled: false,
        config_data: null
      })
      .execute();

    const result = await getVoucherTypes();

    expect(result).toHaveLength(0);
  });

  it('should handle voucher types with null config_data', async () => {
    // Create voucher type with null config
    await db.insert(paymentGatewaysTable)
      .values({
        name: 'Basic Voucher Type',
        is_enabled: true,
        config_data: null
      })
      .execute();

    const result = await getVoucherTypes();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Basic Voucher Type');
    expect(result[0].config_data).toBeNull();
    expect(result[0].is_enabled).toBe(true);
  });

  it('should return multiple enabled voucher types', async () => {
    // Create multiple enabled voucher types
    await db.insert(paymentGatewaysTable)
      .values([
        {
          name: 'Percentage Voucher',
          is_enabled: true,
          config_data: '{"type": "percentage", "value": 15}'
        },
        {
          name: 'Fixed Amount Voucher',
          is_enabled: true,
          config_data: '{"type": "fixed", "value": 50}'
        },
        {
          name: 'Disabled Voucher',
          is_enabled: false,
          config_data: '{"type": "special"}'
        }
      ])
      .execute();

    const result = await getVoucherTypes();

    expect(result).toHaveLength(2);
    
    const names = result.map(v => v.name);
    expect(names).toContain('Percentage Voucher');
    expect(names).toContain('Fixed Amount Voucher');
    expect(names).not.toContain('Disabled Voucher');

    // Verify all returned voucher types are enabled
    result.forEach(voucherType => {
      expect(voucherType.is_enabled).toBe(true);
    });
  });
});
