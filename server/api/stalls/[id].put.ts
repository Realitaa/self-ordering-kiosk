import { updateStall } from "#server/services/stall.service";
import { updateStallSchema } from "#shared/schemas/stall.schema";
import { ApiResponse } from "#server/utils/response";
import { validateSchema } from "#server/utils/validator";
import type { UpdateStallInput } from "#shared/schemas/stall.schema";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const body = await readBody(event);
    const { user } = await requireUserSession(event);

    const validatedData = validateSchema<UpdateStallInput>(
      updateStallSchema,
      body,
    );

    const stall = await updateStall(id!, user.id, user.role, validatedData);

    return ApiResponse.success(stall, "Kios berhasil diperbarui.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
