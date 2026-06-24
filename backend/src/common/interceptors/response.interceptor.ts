import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    totalItems?: number;
    totalPages?: number;
  };
}

/**
 * A controller/service can optionally return `{ message, data, meta }`
 * to customize the message; otherwise a sensible default message is used.
 */
export interface ResponseShape<T> {
  message?: string;
  data: T;
  meta?: ApiSuccessResponse<T>["meta"];
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<T>> {
    return next.handle().pipe(
      map((result) => {
        // Allow handlers to opt into a custom message/meta via { message, data, meta }
        const isShaped =
          result &&
          typeof result === "object" &&
          "data" in result &&
          ("message" in result || "meta" in result);

        const message =
          isShaped && result.message ? result.message : "Request successful";
        const data = isShaped ? result.data : (result ?? null);
        const meta = isShaped ? result.meta : undefined;

        const response: ApiSuccessResponse<T> = {
          success: true,
          message,
          data,
        };
        if (meta) {
          response.meta = meta;
        }
        return response;
      }),
    );
  }
}
