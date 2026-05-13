import type {
  ApiErrorResponse,
  ApiResponseMeta,
  ApiSuccessResponse,
} from '@pos-bluecoral/contracts';

export function successResponse<TData, TMeta extends ApiResponseMeta = ApiResponseMeta>(
  data: TData,
  meta?: TMeta,
): ApiSuccessResponse<TData, TMeta> {
  return meta ? { data, meta } : { data };
}

export function errorResponse(
  code: string,
  message: string,
  requestId?: string,
  details?: unknown,
): ApiErrorResponse {
  return {
    error: {
      code,
      message,
      details,
      requestId,
    },
  };
}
