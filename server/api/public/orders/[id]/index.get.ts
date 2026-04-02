import { getOrderById } from "#server/services/order.service";
import { ApiResponse } from "#server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    const result = await getOrderById(id!);

    return ApiResponse.success(result, "Detail pesanan berhasil dimuat.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
