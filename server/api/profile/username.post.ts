import { setUserSession } from "#imports";
import { updateUsername } from "#server/services/profile.service";
import { ApiResponse } from "~~/server/utils/response";
import { updateUsernameSchema } from "#shared/schemas/profile.schema";
import { validateSchema } from "#server/utils/validator";
import type { UpdateUsernameDTO } from "#shared/schemas/profile.schema";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const validatedData = validateSchema<UpdateUsernameDTO>(
      updateUsernameSchema,
      body,
    );

    const { user } = await requireUserSession(event);

    const updatedUser = await updateUsername(user.id, validatedData.username);

    await setUserSession(event, {
      user: updatedUser,
    });

    return ApiResponse.success(updatedUser, "Nama pengguna berhasil diperbarui.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
