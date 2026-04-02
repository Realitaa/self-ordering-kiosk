import { getPaymentsByStall } from "#server/services/payment.service";
import { ApiResponse } from "#server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const stallId = getRouterParam(event, "id");

    const payments = await getPaymentsByStall(stallId!);

    return ApiResponse.success(payments, "Daftar pembayaran berhasil dimuat.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
