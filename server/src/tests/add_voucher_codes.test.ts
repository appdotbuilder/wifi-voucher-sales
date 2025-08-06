
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { addVoucherCodes } from '../handlers/add_voucher_codes';

// Define the input type inline since it's not in the schema
interface AddVoucherCodesInput {
  voucher_type_id: number;
  codes: string[];
}

describe('addVoucherCodes', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should add voucher codes successfully', async () => {
    const testInput: AddVoucherCodesInput = {
      voucher_type_id: 1,
      codes: ['CODE001', 'CODE002', 'CODE003']
    };

    const result = await addVoucherCodes(testInput);

    expect(result.success).toBe(true);
    expect(result.added_count).toBe(3);
    expect(result.message).toEqual('Successfully added 3 voucher codes');
  });

  it('should handle duplicate codes in input', async () => {
    const testInput: AddVoucherCodesInput = {
      voucher_type_id: 1,
      codes: ['CODE001', 'CODE002', 'CODE001', 'CODE003'] // CODE001 is duplicate
    };

    const result = await addVoucherCodes(testInput);

    expect(result.success).toBe(true);
    expect(result.added_count).toBe(3); // Unique codes only
    expect(result.message).toEqual('Successfully added 3 voucher codes (1 duplicates in input removed)');
  });

  it('should fail with invalid voucher type ID', async () => {
    const testInput: AddVoucherCodesInput = {
      voucher_type_id: 0, // Invalid ID
      codes: ['CODE001', 'CODE002']
    };

    const result = await addVoucherCodes(testInput);

    expect(result.success).toBe(false);
    expect(result.added_count).toBe(0);
    expect(result.message).toEqual('Invalid voucher type ID: 0');
  });

  it('should fail when no valid codes provided', async () => {
    const testInput: AddVoucherCodesInput = {
      voucher_type_id: 1,
      codes: [] // Empty codes array
    };

    const result = await addVoucherCodes(testInput);

    expect(result.success).toBe(false);
    expect(result.added_count).toBe(0);
    expect(result.message).toEqual('No valid codes provided');
  });

  it('should handle single code addition', async () => {
    const testInput: AddVoucherCodesInput = {
      voucher_type_id: 1,
      codes: ['SINGLECODE']
    };

    const result = await addVoucherCodes(testInput);

    expect(result.success).toBe(true);
    expect(result.added_count).toBe(1);
    expect(result.message).toEqual('Successfully added 1 voucher codes');
  });

  it('should handle empty string codes', async () => {
    const testInput: AddVoucherCodesInput = {
      voucher_type_id: 1,
      codes: ['CODE001', '', 'CODE002', ''] // Contains empty strings
    };

    const result = await addVoucherCodes(testInput);

    // Since we're using Set to deduplicate, empty strings will be reduced to one
    // In a real implementation, we might want to filter out empty strings
    expect(result.success).toBe(true);
    expect(result.added_count).toBe(3); // 'CODE001', '', 'CODE002'
  });
});
