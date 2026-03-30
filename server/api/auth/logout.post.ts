import { clearUserSession } from "#imports";
import { ApiResponse } from "~~/server/utils/response";

export default defineEventHandler(async (event) => {
  await clearUserSession(event);

  return ApiResponse.success(null, "Anda berhasil keluar.");
});
