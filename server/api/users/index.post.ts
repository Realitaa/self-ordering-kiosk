import { createUser } from "#server/services/user.service";
import { createUserSchema } from "#shared/schemas/user.schema";
import { ApiResponse } from "#server/utils/response";
import { validateSchema } from "#server/utils/validator";
import type { CreateUserInput } from "#shared/schemas/user.schema";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const validatedData = validateSchema<CreateUserInput>(
      createUserSchema,
      body,
    );

    const user = await createUser(validatedData);

    return ApiResponse.success(user, "Pengguna berhasil ditambahkan.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
