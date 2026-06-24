import { BadRequestException } from "@nestjs/common";

export interface FieldError {
  field: string;
  message: string;
}

/**
 * Thrown by the global ValidationPipe's exceptionFactory so the
 * HttpExceptionFilter can build the `errors[]` array the frontend expects.
 */
export class ValidationException extends BadRequestException {
  constructor(public readonly errors: FieldError[]) {
    super({ message: "Validation failed", errors });
  }
}
