import { getStallsByOwner } from "#server/services/stall.service";
import { ApiResponse } from "#server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event);

    const stalls = await getStallsByOwner(user.id);

    return ApiResponse.success(stalls, "Daftar kios berhasil dimuat.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
