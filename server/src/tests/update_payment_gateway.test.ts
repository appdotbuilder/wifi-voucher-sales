
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { paymentGatewaysTable } from '../db/schema';
import { type UpdatePaymentGatewayInput } from '../schema';
import { updatePaymentGateway } from '../handlers/update_payment_gateway';
import { eq } from 'drizzle-orm';

describe('updatePaymentGateway', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update payment gateway is_enabled field', async () => {
    // Create test payment gateway
    const createResult = await db.insert(paymentGatewaysTable)
      .values({
        name: 'Test Gateway',
        is_enabled: false,
        config_data: 'initial config'
      })
      .returning()
      .execute();

    const paymentGatewayId = createResult[0].id;

    const input: UpdatePaymentGatewayInput = {
      id: paymentGatewayId,
      is_enabled: true
    };

    const result = await updatePaymentGateway(input);

    expect(result.id).toEqual(paymentGatewayId);
    expect(result.is_enabled).toEqual(true);
    expect(result.config_data).toEqual('initial config'); // Should remain unchanged
    expect(result.name).toEqual('Test Gateway'); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update payment gateway config_data field', async () => {
    // Create test payment gateway
    const createResult = await db.insert(paymentGatewaysTable)
      .values({
        name: 'Test Gateway',
        is_enabled: true,
        config_data: 'initial config'
      })
      .returning()
      .execute();

    const paymentGatewayId = createResult[0].id;

    const input: UpdatePaymentGatewayInput = {
      id: paymentGatewayId,
      config_data: 'updated config data'
    };

    const result = await updatePaymentGateway(input);

    expect(result.id).toEqual(paymentGatewayId);
    expect(result.config_data).toEqual('updated config data');
    expect(result.is_enabled).toEqual(true); // Should remain unchanged
    expect(result.name).toEqual('Test Gateway'); // Should remain unchanged
  });

  it('should update multiple fields at once', async () => {
    // Create test payment gateway
    const createResult = await db.insert(paymentGatewaysTable)
      .values({
        name: 'Multi Update Gateway',
        is_enabled: false,
        config_data: 'old config'
      })
      .returning()
      .execute();

    const paymentGatewayId = createResult[0].id;

    const input: UpdatePaymentGatewayInput = {
      id: paymentGatewayId,
      is_enabled: true,
      config_data: 'new config'
    };

    const result = await updatePaymentGateway(input);

    expect(result.id).toEqual(paymentGatewayId);
    expect(result.is_enabled).toEqual(true);
    expect(result.config_data).toEqual('new config');
    expect(result.name).toEqual('Multi Update Gateway');
  });

  it('should save changes to database', async () => {
    // Create test payment gateway
    const createResult = await db.insert(paymentGatewaysTable)
      .values({
        name: 'DB Test Gateway',
        is_enabled: false,
        config_data: null
      })
      .returning()
      .execute();

    const paymentGatewayId = createResult[0].id;

    const input: UpdatePaymentGatewayInput = {
      id: paymentGatewayId,
      is_enabled: true,
      config_data: 'persisted config'
    };

    await updatePaymentGateway(input);

    // Verify changes were saved to database
    const savedGateway = await db.select()
      .from(paymentGatewaysTable)
      .where(eq(paymentGatewaysTable.id, paymentGatewayId))
      .execute();

    expect(savedGateway).toHaveLength(1);
    expect(savedGateway[0].is_enabled).toEqual(true);
    expect(savedGateway[0].config_data).toEqual('persisted config');
    expect(savedGateway[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when payment gateway not found', async () => {
    const input: UpdatePaymentGatewayInput = {
      id: 99999, // Non-existent ID
      is_enabled: true
    };

    expect(updatePaymentGateway(input)).rejects.toThrow(/payment gateway.*not found/i);
  });

  it('should update updated_at timestamp', async () => {
    // Create test payment gateway
    const createResult = await db.insert(paymentGatewaysTable)
      .values({
        name: 'Timestamp Gateway',
        is_enabled: false
      })
      .returning()
      .execute();

    const paymentGatewayId = createResult[0].id;
    const originalUpdatedAt = createResult[0].updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdatePaymentGatewayInput = {
      id: paymentGatewayId,
      is_enabled: true
    };

    const result = await updatePaymentGateway(input);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});
