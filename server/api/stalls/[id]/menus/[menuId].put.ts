import { updateMenu } from "#server/services/menu.service";
import { updateMenuSchema } from "#shared/schemas/menu.schema";
import { ApiResponse } from "#server/utils/response";
import { validateSchema } from "#server/utils/validator";
import type { UpdateMenuInput } from "#shared/schemas/menu.schema";

export default defineEventHandler(async (event) => {
  try {
    const menuId = getRouterParam(event, "menuId");
    const body = await readBody(event);
    const { user } = await requireUserSession(event);

    const validatedData = validateSchema<UpdateMenuInput>(
      updateMenuSchema,
      body,
    );

    const menu = await updateMenu(menuId!, user.id, user.role, validatedData);

    return ApiResponse.success(menu, "Menu berhasil diperbarui.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
