/**
 * JSON API Error Object
 */
export type JsonApiError = {
  /** HTTP status code as a string */
  status: string;
  /** Application-specific error code */
  code?: string;
  /** Short, human-readable summary of the problem */
  title?: string;
  /** Human-readable explanation specific to this occurrence */
  detail: string;
  /** Reference to the source of the error */
  source?: {
    /** JSON Pointer to the value in the request that caused the error */
    pointer?: string;
    /** URI query parameter that caused the error */
    parameter?: string;
    /** Request header that caused the error */
    header?: string;
  };
  /** Non-standard meta-information about the error */
  meta?: Record<string, unknown>;
};

/**
 * JSON API Error Response
 */
export type JsonApiErrorResponse = {
  errors: JsonApiError[];
  jsonapi?: {
    version: string;
  };
};

/**
 * JSON API Success Response with data
 */
export type JsonApiSuccessResponse<T = unknown> = {
  data: T;
  jsonapi?: {
    version: string;
  };
  meta?: Record<string, unknown>;
};

/**
 * Create a JSON API error response
 */
export function createErrorResponse(
  errors: JsonApiError | JsonApiError[],
  includeVersion = true
): JsonApiErrorResponse {
  const errorArray = Array.isArray(errors) ? errors : [errors];

  return {
    errors: errorArray,
    ...(includeVersion && { jsonapi: { version: '1.1' } }),
  };
}

/**
 * Create a JSON API success response
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: Record<string, unknown>,
  includeVersion = true
): JsonApiSuccessResponse<T> {
  return {
    data,
    ...(includeVersion && { jsonapi: { version: '1.1' } }),
    ...(meta && { meta }),
  };
}

/**
 * Create a validation error object
 */
export function createValidationError(
  detail: string,
  pointer?: string,
  title = 'Validation Error'
): JsonApiError {
  return {
    status: '400',
    title,
    detail,
    ...(pointer && { source: { pointer } }),
  };
}

/**
 * Create an internal server error object
 */
export function createInternalError(
  detail: string,
  meta?: Record<string, unknown>
): JsonApiError {
  return {
    status: '500',
    title: 'Internal Server Error',
    detail,
    ...(meta && { meta }),
  };
}
