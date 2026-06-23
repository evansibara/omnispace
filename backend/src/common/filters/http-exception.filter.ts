import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { FieldError } from '../exceptions/validation.exception';

interface ErrorEnvelope {
  success: false;
  message: string;
  statusCode: number;
  errors?: FieldError[];
}

/**
 * Normalizes every thrown error (HttpException, ValidationException,
 * Prisma errors, or anything unhandled) into the exact shape the frontend's
 * Axios interceptor expects. A 401 always surfaces as statusCode 401 so the
 * frontend can reliably clear local state and redirect to /login.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: FieldError[] | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const payload = body as Record<string, unknown>;

        if (Array.isArray(payload.errors)) {
          // ValidationException shape: { message: 'Validation failed', errors: [...] }
          errors = payload.errors as FieldError[];
          message = (payload.message as string) ?? 'Validation failed';
        } else if (Array.isArray(payload.message)) {
          // Defensive fallback for Nest's default ValidationPipe shape
          message = 'Validation failed';
          errors = (payload.message as string[]).map((m) => ({ field: 'unknown', message: m }));
        } else {
          message = (payload.message as string) ?? exception.message;
        }
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.error('Unknown exception thrown', JSON.stringify(exception));
    }

    const envelope: ErrorEnvelope = {
      success: false,
      message,
      statusCode,
    };
    if (errors && errors.length > 0) {
      envelope.errors = errors;
    }

    response.status(statusCode).json(envelope);
  }
}
