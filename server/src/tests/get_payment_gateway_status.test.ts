
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { paymentGatewaysTable } from '../db/schema';
import { getPaymentGatewayStatus } from '../handlers/get_payment_gateway_status';

describe('getPaymentGatewayStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no payment gateways exist', async () => {
    const result = await getPaymentGatewayStatus();
    
    expect(result).toEqual([]);
  });

  it('should return payment gateway configurations', async () => {
    // Create test payment gateways
    await db.insert(paymentGatewaysTable)
      .values([
        {
          name: 'PayPal',
          is_enabled: true,
          config_data: '{"api_key": "test_key_1"}'
        },
        {
          name: 'Stripe',
          is_enabled: false,
          config_data: '{"api_key": "test_key_2"}'
        }
      ])
      .execute();

    const result = await getPaymentGatewayStatus();

    expect(result).toHaveLength(2);
    
    // Check first gateway
    expect(result[0].name).toEqual('PayPal');
    expect(result[0].is_enabled).toBe(true);
    expect(result[0].config_data).toEqual('{"api_key": "test_key_1"}');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // Check second gateway
    expect(result[1].name).toEqual('Stripe');
    expect(result[1].is_enabled).toBe(false);
    expect(result[1].config_data).toEqual('{"api_key": "test_key_2"}');
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);
    expect(result[1].updated_at).toBeInstanceOf(Date);
  });

  it('should handle payment gateway with null config_data', async () => {
    // Create payment gateway without config_data
    await db.insert(paymentGatewaysTable)
      .values({
        name: 'Bank Transfer',
        is_enabled: true,
        config_data: null
      })
      .execute();

    const result = await getPaymentGatewayStatus();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Bank Transfer');
    expect(result[0].is_enabled).toBe(true);
    expect(result[0].config_data).toBeNull();
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return payment gateways sorted by id', async () => {
    // Create multiple payment gateways
    await db.insert(paymentGatewaysTable)
      .values([
        { name: 'Gateway C', is_enabled: false, config_data: null },
        { name: 'Gateway A', is_enabled: true, config_data: '{"test": "data"}' },
        { name: 'Gateway B', is_enabled: true, config_data: null }
      ])
      .execute();

    const result = await getPaymentGatewayStatus();

    expect(result).toHaveLength(3);
    
    // Results should be returned in database order (by id)
    expect(result[0].name).toEqual('Gateway C');
    expect(result[1].name).toEqual('Gateway A');
    expect(result[2].name).toEqual('Gateway B');
    
    // Verify all have proper structure
    result.forEach(gateway => {
      expect(typeof gateway.id).toBe('number');
      expect(typeof gateway.name).toBe('string');
      expect(typeof gateway.is_enabled).toBe('boolean');
      expect(gateway.config_data === null || typeof gateway.config_data === 'string').toBe(true);
      expect(gateway.created_at).toBeInstanceOf(Date);
      expect(gateway.updated_at).toBeInstanceOf(Date);
    });
  });
});
