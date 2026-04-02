import { deleteUser } from "#server/services/user.service";
import { ApiResponse } from "#server/utils/response";
import { BadRequestError } from "#server/utils/exceptions";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    // check if user is the same as the logged in user
    const { user } = await requireUserSession(event)
    if (user.id === id) {
      throw new BadRequestError({ id: ["Anda tidak dapat menghapus diri sendiri."] }, "Tidak dapat menghapus diri sendiri.");
    }

    await deleteUser(id);

    return ApiResponse.success(null, "Pengguna berhasil dihapus.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
