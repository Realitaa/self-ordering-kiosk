// 400 Bad Request
export class BadRequestError extends Error {
  public fields: Record<string, string[]>;
  constructor(fields: Record<string, string[]>, message = "Bad request") {
    super(message);
    this.name = "BadRequestError";
    this.fields = fields;
  }
}

// 401 Unauthorized
export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

// 403 Forbidden
export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

// 404 Not Found
export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

// 409 Conflict
export class ConflictError extends Error {
  constructor(message = "Conflict") {
    super(message);
    this.name = "ConflictError";
  }
}
