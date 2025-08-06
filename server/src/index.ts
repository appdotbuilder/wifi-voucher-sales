
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  loginInputSchema,
  updateAdminCredentialsInputSchema,
  updateVoucherTypeInputSchema,
  addVoucherCodesInputSchema,
  purchaseVoucherInputSchema,
  salesReportInputSchema
} from './schema';

// Import handlers
import { loginAdmin } from './handlers/login_admin';
import { updateAdminCredentials } from './handlers/update_admin_credentials';
import { getVoucherTypes } from './handlers/get_voucher_types';
import { updateVoucherType } from './handlers/update_voucher_type';
import { addVoucherCodes } from './handlers/add_voucher_codes';
import { getVoucherInventory } from './handlers/get_voucher_inventory';
import { purchaseVoucher } from './handlers/purchase_voucher';
import { getSalesReport } from './handlers/get_sales_report';
import { getAllSales } from './handlers/get_all_sales';
import { getPaymentGatewayStatus } from './handlers/get_payment_gateway_status';
import { updatePaymentGateway } from './handlers/update_payment_gateway';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication
  loginAdmin: publicProcedure
    .input(loginInputSchema)
    .mutation(({ input }) => loginAdmin(input)),

  // Admin management
  updateAdminCredentials: publicProcedure
    .input(updateAdminCredentialsInputSchema)
    .mutation(({ input }) => updateAdminCredentials(input)),

  // Voucher type management
  getVoucherTypes: publicProcedure
    .query(() => getVoucherTypes()),

  updateVoucherType: publicProcedure
    .input(updateVoucherTypeInputSchema)
    .mutation(({ input }) => updateVoucherType(input)),

  // Voucher code management
  addVoucherCodes: publicProcedure
    .input(addVoucherCodesInputSchema)
    .mutation(({ input }) => addVoucherCodes(input)),

  getVoucherInventory: publicProcedure
    .query(() => getVoucherInventory()),

  // Sales and purchases
  purchaseVoucher: publicProcedure
    .input(purchaseVoucherInputSchema)
    .mutation(({ input }) => purchaseVoucher(input)),

  getAllSales: publicProcedure
    .query(() => getAllSales()),

  // Reports
  getSalesReport: publicProcedure
    .input(salesReportInputSchema)
    .query(({ input }) => getSalesReport(input)),

  // Payment gateway
  getPaymentGatewayStatus: publicProcedure
    .query(() => getPaymentGatewayStatus()),

  updatePaymentGateway: publicProcedure
    .input(updateVoucherTypeInputSchema) // Reuse similar schema structure
    .mutation(({ input }) => updatePaymentGateway(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
