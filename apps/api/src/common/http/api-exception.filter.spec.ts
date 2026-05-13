import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { ApiExceptionFilter } from './api-exception.filter';

describe('ApiExceptionFilter', () => {
  it('preserves validation metadata when Nest returns message/error fields', () => {
    const filter = new ApiExceptionFilter();
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({ requestId: 'req-123' }),
        getResponse: () => ({ json, status }),
      }),
    } as ArgumentsHost;

    filter.catch(
      new HttpException(
        {
          code: 'validation-failed',
          error: 'Bad Request',
          message: ['tenantName should not be empty'],
        },
        HttpStatus.BAD_REQUEST,
      ),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'validation-failed',
        details: {
          error: 'Bad Request',
          message: ['tenantName should not be empty'],
        },
        message: 'tenantName should not be empty',
        requestId: 'req-123',
      },
    });
  });
});
