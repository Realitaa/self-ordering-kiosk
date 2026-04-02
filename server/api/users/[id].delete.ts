import { deleteUser } from "#server/services/user.service";
import { ApiResponse } from "#server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    await deleteUser(id!);

    return ApiResponse.success(null, "Pengguna berhasil dihapus.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
