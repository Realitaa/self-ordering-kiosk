import { getStallById } from "#server/services/stall.service";
import { ApiResponse } from "#server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    const stall = await getStallById(id!);

    return ApiResponse.success(stall, "Detail kios berhasil dimuat.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
