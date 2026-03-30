import { setUserSession } from "#imports";
import { login } from "#server/services/auth.service";
import { loginSchema } from "#shared/schemas/login.schema";
import { ApiResponse } from "#server/utils/response";
import { validateSchema } from "#server/utils/validator";
import type { LoginInput } from "#shared/schemas/login.schema";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const validatedData = validateSchema<LoginInput>(loginSchema, body);

    const { user } = await login(
      validatedData.email,
      validatedData.password,
    );

    await setUserSession(event, {
      user,
    });

    return ApiResponse.success(
      user,
      "Anda berhasil masuk dan akan diarahkan ke halaman beranda.",
    );
  } catch (e) {
    return ApiResponse.error(e);
  }
});
