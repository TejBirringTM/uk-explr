export type ApiSuccessResponse<T extends object> = {
  success: true;
  status: number;
  error: false;
} & T;

export type ApiErrorResponse = {
  success: false;
  error: true;
  status: number;
  message?: string;
};

export type ApiResponse<T extends object> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse;
