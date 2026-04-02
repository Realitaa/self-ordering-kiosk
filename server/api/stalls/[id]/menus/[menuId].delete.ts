import { deleteMenu } from "#server/services/menu.service";
import { ApiResponse } from "#server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const menuId = getRouterParam(event, "menuId");
    const { user } = await requireUserSession(event);

    await deleteMenu(menuId!, user.id, user.role);

    return ApiResponse.success(null, "Menu berhasil dihapus.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
