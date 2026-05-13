export interface ApiResponseMeta {
  scope?: string;
  requestId?: string;
}

export interface ApiSuccessResponse<TData, TMeta extends ApiResponseMeta = ApiResponseMeta> {
  data: TData;
  meta?: TMeta;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
}

export * from './tenants';
