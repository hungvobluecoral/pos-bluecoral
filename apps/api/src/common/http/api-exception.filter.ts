import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { errorResponse } from './api-response';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();
    const requestId = request.requestId;

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const code = this.resolveCode(exception, status);
    const message = this.resolveMessage(exception, status);
    const details =
      exception instanceof HttpException
        ? this.resolveDetails(exception.getResponse())
        : undefined;

    response.status(status).json(errorResponse(code, message, requestId, details));
  }

  private resolveCode(exception: unknown, status: number) {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (
        typeof response === 'object' &&
        response !== null &&
        'code' in response &&
        typeof response.code === 'string'
      ) {
        return response.code;
      }
    }

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'badRequest';
      case HttpStatus.UNAUTHORIZED:
        return 'unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'forbidden';
      case HttpStatus.NOT_FOUND:
        return 'notFound';
      case HttpStatus.CONFLICT:
        return 'conflict';
      default:
        return 'internalServerError';
    }
  }

  private resolveMessage(exception: unknown, status: number) {
    if (status === HttpStatus.NOT_FOUND) {
      return 'Resource not found';
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return response;
      }

      if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        const { message } = response as { message?: string | string[] };
        if (Array.isArray(message)) {
          return message.join(', ');
        }
        if (typeof message === 'string') {
          return message;
        }
      }
    }

    return 'Unexpected server error';
  }

  private resolveDetails(response: string | object) {
    if (typeof response === 'string') {
      return undefined;
    }

    if ('details' in response) {
      return response.details;
    }

    const fallbackDetails: Record<string, unknown> = {};

    if ('error' in response) {
      fallbackDetails.error = response.error;
    }

    if ('message' in response && Array.isArray(response.message)) {
      fallbackDetails.message = response.message;
    }

    return Object.keys(fallbackDetails).length > 0 ? fallbackDetails : undefined;
  }
}
