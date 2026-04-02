import * as stallRepo from "#server/repositories/stall.repository";
import { transformStallList } from "#server/utils/transformers";
import { ApiResponse } from "#server/utils/response";

export default defineEventHandler(async () => {
  try {
    const stalls = await stallRepo.findAll();
    return ApiResponse.success(transformStallList(stalls), "Daftar kios berhasil dimuat.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
