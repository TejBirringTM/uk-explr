import type { ErrorRequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ParsedQs } from "qs";
import { ServerError } from "../types/server-error";
import type { ApiErrorResponse } from "../types/api-response";

export default function transmitErrors<
  P = ParamsDictionary,
  ReqBody = any,
  ReqQuery = ParsedQs,
>() {
  return ((err, req, res, next) => {
    if (err instanceof ServerError) {
      res.status(err.status).json({
        success: false,
        error: true,
        status: err.status,
        message: err.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: true,
        status: 500,
        message: "<No message>",
      });
    }
  }) satisfies ErrorRequestHandler<P, ApiErrorResponse, ReqBody, ReqQuery, {}>;
}
