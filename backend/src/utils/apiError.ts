export class ApiError extends Error {
    constructor(
      public status: number,
      public code: string,
      message: string
    ) {
      super(message);
    }
  
    static badRequest(msg = 'Validation failed') {
      return new ApiError(400, 'BAD_REQUEST', msg);
    }
    static unauthorized(msg = 'Unauthorized') {
      return new ApiError(401, 'UNAUTHORIZED', msg);
    }
    static forbidden(msg = 'Forbidden') {
      return new ApiError(403, 'FORBIDDEN', msg);
    }
    static notFound(msg = 'Not found') {
      return new ApiError(404, 'NOT_FOUND', msg);
    }
    static conflict(msg = 'Conflict') {
      return new ApiError(409, 'CONFLICT', msg);
    }
  }