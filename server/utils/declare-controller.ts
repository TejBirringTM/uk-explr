import type { ApiSuccessResponse } from "../types/api-response";
import declareRequestHandler, {
  type ServerRequestHandler,
} from "./declare-request-handler";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ZodType } from "zod";
import type { Request } from "express";
import asyncHandler from "express-async-handler";
import requestValidator from "../middleware/request-validator.middleware";
import type { Locals } from "../types/express";
import type { ParsedQs } from "qs";

export function declareController<
  ReqBody extends object | undefined,
  ResBody extends object,
  ReqQuery extends object,
  P = ParamsDictionary,
>(
  requestSchemas: {
    bodySchema: ZodType<ReqBody>;
    querySchema: ZodType<ReqQuery>;
  },
  responseSchema: ZodType<ResBody>,
  fn: (
    req: Request<
      P,
      ApiSuccessResponse<ResBody>,
      ReqBody,
      ReqQuery,
      Locals<ResBody>
    >,
  ) => Promise<ResBody>,
) {
  return [
    requestValidator<ReqBody, ResBody, ReqQuery, P>(
      requestSchemas.bodySchema,
      requestSchemas.querySchema,
    ) as ServerRequestHandler<ReqBody, ResBody, ParsedQs, P>,
    asyncHandler(
      declareRequestHandler<ReqBody, ResBody, ReqQuery, P>(
        async (req, res, next) => {
          res.locals.responseSchema = responseSchema;
          res.locals.response = await fn(req);
          next();
        },
      ) as ServerRequestHandler<ReqBody, ResBody, ParsedQs, P>,
    ),
  ];
}
