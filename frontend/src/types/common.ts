/**
 * Shared, cross-feature primitives.
 * Domain-specific types live in `features/<feature>/types`.
 */

/** Standard envelope returned by every OmniSpace API endpoint. */
export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
  meta?: ResponseMeta;
}

export interface ResponseMeta {
  page?: number;
  limit?: number;
  totalItems?: number;
  totalPages?: number;
}

/** Shape of a failed request as normalized by the Axios interceptor. */
export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  errors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

/** Generic paginated list payload. */
export interface PaginatedResult<TItem> {
  items: TItem[];
  meta: Required<ResponseMeta>;
}

/** Query params shared by every "list" endpoint. */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** Discriminated union for async UI states beyond TanStack Query's own. */
export type AsyncStatus = "idle" | "loading" | "success" | "error";
