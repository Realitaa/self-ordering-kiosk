import { createStall } from "#server/services/stall.service";
import { createStallSchema } from "#shared/schemas/stall.schema";
import { ApiResponse } from "#server/utils/response";
import { validateSchema } from "#server/utils/validator";
import type { CreateStallInput } from "#shared/schemas/stall.schema";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { user } = await requireUserSession(event);

    const validatedData = validateSchema<CreateStallInput>(
      createStallSchema,
      body,
    );

    const stall = await createStall(validatedData.name, user.id);

    return ApiResponse.success(stall, "Kios berhasil ditambahkan.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
