import { setUserSession } from "#imports";
import { updateProfilePicture } from "#server/services/profile.service";
import { ApiResponse } from "~~/server/utils/response";
import { updateProfilePictureSchema } from "#shared/schemas/profile.schema";
import { validateSchema } from "#server/utils/validator";
import type { UpdateProfilePictureDTO } from "#shared/schemas/profile.schema";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const validatedData = validateSchema<UpdateProfilePictureDTO>(
      updateProfilePictureSchema,
      body,
    );

    const { user } = await requireUserSession(event);

    const updatedUser = await updateProfilePicture(user.id, validatedData.pfp_id);

    await setUserSession(event, {
      user: updatedUser,
    });

    return ApiResponse.success(updatedUser, "Foto profil berhasil diperbarui.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
