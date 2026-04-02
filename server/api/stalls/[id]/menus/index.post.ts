import { createMenu } from "#server/services/menu.service";
import { createMenuSchema } from "#shared/schemas/menu.schema";
import { ApiResponse } from "#server/utils/response";
import { validateSchema } from "#server/utils/validator";
import type { CreateMenuInput } from "#shared/schemas/menu.schema";

export default defineEventHandler(async (event) => {
  try {
    const stallId = getRouterParam(event, "id");
    const body = await readBody(event);
    const { user } = await requireUserSession(event);

    const validatedData = validateSchema<CreateMenuInput>(
      createMenuSchema,
      body,
    );

    const menu = await createMenu(stallId!, user.id, user.role, validatedData);

    return ApiResponse.success(menu, "Menu berhasil ditambahkan.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
