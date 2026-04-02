import { getMenusByStall } from "#server/services/menu.service";
import { ApiResponse } from "#server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const stallId = getRouterParam(event, "id");

    const menus = await getMenusByStall(stallId!);

    return ApiResponse.success(menus, "Daftar menu berhasil dimuat.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
