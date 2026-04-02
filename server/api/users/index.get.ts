import { getAllUsers } from "#server/services/user.service";
import { ApiResponse } from "#server/utils/response";

export default defineEventHandler(async () => {
  try {
    const users = await getAllUsers();

    return ApiResponse.success(users, "Daftar pengguna berhasil dimuat.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
