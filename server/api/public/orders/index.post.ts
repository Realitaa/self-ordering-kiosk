import { createOrder } from "#server/services/order.service";
import { createOrderSchema } from "#shared/schemas/order.schema";
import { ApiResponse } from "#server/utils/response";
import { validateSchema } from "#server/utils/validator";
import type { CreateOrderInput } from "#shared/schemas/order.schema";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const validatedData = validateSchema<CreateOrderInput>(
      createOrderSchema,
      body,
    );

    const result = await createOrder(validatedData);

    return ApiResponse.success(result, "Pesanan berhasil dibuat.");
  } catch (e) {
    return ApiResponse.error(e);
  }
});
