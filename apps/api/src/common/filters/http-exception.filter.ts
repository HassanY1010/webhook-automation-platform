import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP_EXCEPTION_FILTER');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();

    const requestId = request.requestId || (request.headers['x-request-id'] as string) || 'unknown';
    const path = request.url || '';
    const method = request.method || '';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorType = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      errorType = exception.name || 'HttpException';

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj.message || resObj.error || exception.message;
        errorType = resObj.error || exception.name;
      }
    } else if (exception && typeof exception === 'object') {
      const err = exception as any;
      // Handle Prisma Known Errors
      if (err.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        errorType = 'ConflictException';
        const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : (err.meta?.target || 'field');
        message = `Resource with matching ${target} already exists`;
      } else if (err.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        errorType = 'NotFoundException';
        message = 'Requested record was not found';
      } else if (err.code === 'P1000' || err.code === 'P1001' || err.code === 'P1017') {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        errorType = 'ServiceUnavailableException';
        message = 'Database service is temporarily unavailable';
      } else {
        errorType = err.name || 'UnhandledException';
        message = process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : err.message || 'Internal server error';
      }
    }

    const firstMessage = Array.isArray(message) ? message[0] : message;

    // Secure Production Logging (Sanitized — NEVER log credentials, JWTs, or passwords)
    if (path.includes('/auth/login')) {
      console.error(
        `[AUTH_LOGIN_ERROR] requestId=${requestId} errorType=${errorType} message="${firstMessage}" statusCode=${status}`
      );
    } else if (path.includes('/auth/register')) {
      console.error(
        `[AUTH_REGISTER_ERROR] requestId=${requestId} errorType=${errorType} message="${firstMessage}" statusCode=${status}`
      );
    } else {
      console.error(
        `[API_ERROR] requestId=${requestId} method=${method} path=${path} statusCode=${status} errorType=${errorType} message="${firstMessage}"`
      );
    }

    // Format uniform response
    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      error: errorType,
      requestId,
      timestamp: new Date().toISOString(),
    });
  }
}
