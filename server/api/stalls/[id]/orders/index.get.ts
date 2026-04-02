import { getOrdersByStall } from "#server/services/order.service";
import { ApiResponse } from "#server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const stallId = getRouterParam(event, "id");

    const orders = await getOrdersByStall(stallId!);

    return ApiResponse.success(orders, "Daftar pesanan berhasil dimuat.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
