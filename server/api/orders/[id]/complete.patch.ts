import { markOrderComplete } from "#server/services/order.service";
import { ApiResponse } from "#server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const { user } = await requireUserSession(event);

    const order = await markOrderComplete(id!, user.id, user.role);

    return ApiResponse.success(order, "Pesanan berhasil diselesaikan.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
