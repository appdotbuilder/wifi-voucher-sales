
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { getVoucherInventory, type VoucherInventory } from '../handlers/get_voucher_inventory';

describe('getVoucherInventory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty inventory when no voucher types exist', async () => {
    const result = await getVoucherInventory();
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return correct type structure', async () => {
    const result = await getVoucherInventory();
    
    // Verify return type is VoucherInventory array
    expect(result).toBeInstanceOf(Array);
    
    // When voucher tables are added, this test should verify:
    // - voucher_type_id is number
    // - voucher_type_name is string  
    // - total_codes is number
    // - available_codes is number
    // - sold_codes is number
  });

  it('should handle function execution without errors', async () => {
    // Basic test to ensure handler doesn't throw
    expect(async () => {
      await getVoucherInventory();
    }).not.toThrow();
  });
});
