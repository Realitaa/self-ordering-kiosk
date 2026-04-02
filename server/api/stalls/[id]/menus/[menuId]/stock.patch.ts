import { updateMenuStock } from "#server/services/menu.service";
import { updateStockSchema } from "#shared/schemas/menu.schema";
import { ApiResponse } from "#server/utils/response";
import { validateSchema } from "#server/utils/validator";
import type { UpdateStockInput } from "#shared/schemas/menu.schema";

export default defineEventHandler(async (event) => {
  try {
    const menuId = getRouterParam(event, "menuId");
    const body = await readBody(event);
    const { user } = await requireUserSession(event);

    const validatedData = validateSchema<UpdateStockInput>(
      updateStockSchema,
      body,
    );

    const menu = await updateMenuStock(menuId!, user.id, user.role, validatedData.stock);

    return ApiResponse.success(menu, "Stok berhasil diperbarui.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
