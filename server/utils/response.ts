import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "./exceptions";

export const ApiResponse = {
  success: (data: any, message = "Success") => ({
    success: true,
    message,
    data,
  }),

  error(err: unknown) {
    let statusCode = 500;
    let statusMessage = "Internal Server Error";
    let message = "Terjadi kesalahan di server kami";
    let errors = null;

    if (err instanceof BadRequestError) {
      statusCode = 400;
      statusMessage = err.name; // "BadRequestError"
      message = err.message;
      errors = err.fields; // Ambil detail field
    } else if (err instanceof UnauthorizedError) {
      statusCode = 401;
      statusMessage = err.name; // "UnauthorizedError"
      message = err.message;
    } else if (err instanceof ForbiddenError) {
      statusCode = 403;
      statusMessage = err.name; // "ForbiddenError"
      message = err.message;
    } else if (err instanceof NotFoundError) {
      statusCode = 404;
      statusMessage = err.name; // "NotFoundError"
      message = err.message;
    } else if (err instanceof ConflictError) {
      statusCode = 409;
      statusMessage = err.name; // "ConflictError"
      message = err.message;
    }

    throw createError({
      statusCode,
      statusMessage,
      message,
      data: {
        errors,
      },
    });
  },
};
