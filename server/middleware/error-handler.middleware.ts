import type { ErrorRequestHandler } from "express";
import { ServerError } from "../types/server-error";
import { logError } from "@/libs/error";
import type { ApiErrorResponse } from "../types/api-response";
import type { Locals } from "../types/express";
import { type ParamsDictionary } from "express-serve-static-core";
import { cache } from "../services/cache";

export default function errorHandler<
  ReqBody extends object | undefined,
  ResBody extends object,
  ReqQuery extends object,
  P = ParamsDictionary,
>() {
  return ((err, req, res, next) => {
    logError(err);
    let errorResponseObj: ApiErrorResponse = {
      success: false,
      error: true,
      status: 500,
      message: "<No message>",
    };
    if (err instanceof ServerError) {
      errorResponseObj = {
        success: false,
        error: true,
        status: err.status,
        message: err.message,
      };
    }

    if (res.locals.responseCacheKey) {
      cache.set(res.locals.responseCacheKey, JSON.stringify(errorResponseObj));
      console.log(
        `Cached error response '${res.locals.responseCacheKey}':\n`,
        errorResponseObj,
      );
    }
    res.status(errorResponseObj.status).json(errorResponseObj);
  }) satisfies ErrorRequestHandler<
    P,
    ApiErrorResponse,
    ReqBody,
    Locals<ResBody>
  >;
}
