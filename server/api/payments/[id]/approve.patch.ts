import { approvePayment } from "#server/services/payment.service";
import { ApiResponse } from "#server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const { user } = await requireUserSession(event);

    const payment = await approvePayment(id!, user.id, user.role);

    return ApiResponse.success(payment, "Pembayaran berhasil disetujui.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
