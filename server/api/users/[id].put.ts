import { updateUser } from "#server/services/user.service";
import { updateUserSchema } from "#shared/schemas/user.schema";
import { ApiResponse } from "#server/utils/response";
import { validateSchema } from "#server/utils/validator";
import type { UpdateUserInput } from "#shared/schemas/user.schema";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const body = await readBody(event);

    const validatedData = validateSchema<UpdateUserInput>(
      updateUserSchema,
      body,
    );

    const user = await updateUser(id!, validatedData);

    return ApiResponse.success(user, "Pengguna berhasil diperbarui.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
