import * as paymentRepo from "#server/repositories/payment.repository";
import * as stallRepo from "#server/repositories/stall.repository";
import * as orderRepo from "#server/repositories/order.repository";
import { transformPayment, transformPaymentList } from "#server/utils/transformers";
import { NotFoundError, ForbiddenError } from "~~/server/utils/exceptions";

export const getPaymentsByStall = async (stallId: string) => {
  const payments = await paymentRepo.findByStallId(stallId);
  return transformPaymentList(payments);
};

export const approvePayment = async (
  paymentId: string,
  userId: number,
  userRole: string,
) => {
  const payment = await paymentRepo.findById(paymentId);
  if (!payment) throw new NotFoundError("Pembayaran tidak ditemukan");

  // Ownership check: only stall owner or admin
  if (userRole !== "admin") {
    const stall = await stallRepo.findById(String(payment.tenant_id));
    if (!stall || stall.owner_id !== userId) {
      throw new ForbiddenError("Anda tidak memiliki akses untuk menyetujui pembayaran ini");
    }
  }

  if (payment.status === "paid") {
    return transformPayment(payment);
  }

  const updated = await paymentRepo.markPaid(payment.id);

  // Also update order status to processing
  await orderRepo.updateStatus(payment.order_id, "processing");

  return transformPayment({ ...updated, tenant_id: payment.tenant_id, customer_name: payment.customer_name });
};

export const approvePaymentByOrderId = async (orderId: string) => {
  const payment = await paymentRepo.findByOrderId(orderId);
  if (!payment) throw new NotFoundError("Pembayaran tidak ditemukan");

  if (payment.status === "paid") {
    return { already_paid: true };
  }

  await paymentRepo.markPaid(payment.id);
  await orderRepo.updateStatus(payment.order_id, "processing");

  return { already_paid: false };
};
