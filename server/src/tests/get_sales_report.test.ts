
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { getSalesReport } from '../handlers/get_sales_report';

// Define types inline to match the handler
type SalesReportInput = {
  start_date: Date;
  end_date: Date;
  group_by: 'day' | 'month' | 'year';
};

type VoucherTypeSales = {
  voucher_type: string;
  count: number;
  revenue: number;
};

type DailySales = {
  date: Date;
  sales_count: number;
  revenue: number;
};

// Test input for sales report
const testInput: SalesReportInput = {
  start_date: new Date('2024-01-01'),
  end_date: new Date('2024-01-31'),
  group_by: 'day'
};

describe('getSalesReport', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should generate a sales report', async () => {
    const result = await getSalesReport(testInput);

    // Validate basic structure
    expect(result).toBeDefined();
    expect(typeof result.total_sales).toBe('number');
    expect(typeof result.total_revenue).toBe('number');
    expect(Array.isArray(result.sales_by_voucher_type)).toBe(true);
    expect(Array.isArray(result.daily_sales)).toBe(true);
  });

  it('should return non-negative totals', async () => {
    const result = await getSalesReport(testInput);

    expect(result.total_sales).toBeGreaterThanOrEqual(0);
    expect(result.total_revenue).toBeGreaterThanOrEqual(0);
  });

  it('should return properly structured voucher type breakdown', async () => {
    const result = await getSalesReport(testInput);

    // Check each voucher type entry has required fields
    result.sales_by_voucher_type.forEach((entry: VoucherTypeSales) => {
      expect(typeof entry.voucher_type).toBe('string');
      expect(typeof entry.count).toBe('number');
      expect(typeof entry.revenue).toBe('number');
      expect(entry.count).toBeGreaterThanOrEqual(0);
      expect(entry.revenue).toBeGreaterThanOrEqual(0);
    });
  });

  it('should return properly structured daily sales data', async () => {
    const result = await getSalesReport(testInput);

    // Check each daily sales entry has required fields
    result.daily_sales.forEach((entry: DailySales) => {
      expect(entry.date).toBeInstanceOf(Date);
      expect(typeof entry.sales_count).toBe('number');
      expect(typeof entry.revenue).toBe('number');
      expect(entry.sales_count).toBeGreaterThanOrEqual(0);
      expect(entry.revenue).toBeGreaterThanOrEqual(0);
    });
  });

  it('should handle different date ranges', async () => {
    const weekInput: SalesReportInput = {
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-07'),
      group_by: 'day'
    };

    const result = await getSalesReport(weekInput);

    expect(result).toBeDefined();
    expect(typeof result.total_sales).toBe('number');
    expect(typeof result.total_revenue).toBe('number');
  });

  it('should handle monthly grouping', async () => {
    const monthlyInput: SalesReportInput = {
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-12-31'),
      group_by: 'month'
    };

    const result = await getSalesReport(monthlyInput);

    expect(result).toBeDefined();
    expect(Array.isArray(result.daily_sales)).toBe(true);
    expect(Array.isArray(result.sales_by_voucher_type)).toBe(true);
  });

  it('should maintain data consistency', async () => {
    const result = await getSalesReport(testInput);

    // Total sales should match sum of voucher type counts
    const totalVoucherSales = result.sales_by_voucher_type.reduce(
      (sum: number, entry: VoucherTypeSales) => sum + entry.count,
      0
    );
    expect(result.total_sales).toBe(totalVoucherSales);

    // Total revenue should match sum of voucher type revenues
    const totalVoucherRevenue = result.sales_by_voucher_type.reduce(
      (sum: number, entry: VoucherTypeSales) => sum + entry.revenue,
      0
    );
    expect(Math.abs(result.total_revenue - totalVoucherRevenue)).toBeLessThan(0.01);
  });
});
