import { deleteStall } from "#server/services/stall.service";
import { ApiResponse } from "#server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const { user } = await requireUserSession(event);

    await deleteStall(id!, user.id, user.role);

    return ApiResponse.success(null, "Kios berhasil dihapus.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
