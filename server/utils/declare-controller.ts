import type { ApiSuccessResponse } from "../types/api-response";
import declareRequestHandler from "./declare-request-handler";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ParsedQs } from "qs";
import type { ZodType } from "zod";
import type { Request } from "express";
import asyncHandler from "express-async-handler";
import type { Locals } from "../types/express";
import validateRequestBody from "../middleware/validate-request-body.middleware";

export function declareController<
  ReqBody extends object | undefined,
  ResInnerBody extends object,
  P = ParamsDictionary,
  ReqQuery = ParsedQs,
>(
  requestSchema: ZodType<ReqBody>,
  responseSchema: ZodType<ResInnerBody>,
  fn: (
    req: Request<
      P,
      ApiSuccessResponse<Locals<ResInnerBody>["response"]>,
      ReqBody,
      ReqQuery,
      Locals<ResInnerBody>
    >,
  ) => Promise<ResInnerBody>,
) {
  return [
    validateRequestBody(requestSchema),
    asyncHandler(
      declareRequestHandler<ReqBody, ResInnerBody, P, ReqQuery>(
        async (req, res, next) => {
          res.locals.responseSchema = responseSchema;
          res.locals.response = await fn(req);
          next();
        },
      ),
    ),
  ];
}
