import { ValidationError } from "class-validator";
import {
  ValidationException,
  FieldError,
} from "../exceptions/validation.exception";

/**
 * Passed as `exceptionFactory` to the global ValidationPipe. Maps
 * class-validator's per-field ValidationError[] into the `errors[]`
 * shape the frontend expects: { field, message }, taking the first
 * constraint message per field.
 */
export function validationExceptionFactory(
  validationErrors: ValidationError[] = [],
): ValidationException {
  const errors: FieldError[] = [];

  const collect = (errs: ValidationError[], parentPath = ""): void => {
    for (const err of errs) {
      const field = parentPath ? `${parentPath}.${err.property}` : err.property;
      if (err.constraints) {
        const firstMessage = Object.values(err.constraints)[0];
        errors.push({ field, message: firstMessage });
      }
      if (err.children && err.children.length > 0) {
        collect(err.children, field);
      }
    }
  };

  collect(validationErrors);
  return new ValidationException(errors);
}
