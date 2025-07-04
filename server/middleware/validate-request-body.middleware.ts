import type { ParamsDictionary } from "express-serve-static-core";
import type { ParsedQs } from "qs";
import type { ZodType } from "zod";
import declareRequestHandler from "../utils/declare-request-handler";
import { ServerError } from "../types/server-error";

export default function validateRequestBody<
  ReqBody extends object,
  P = ParamsDictionary,
  ReqQuery = ParsedQs,
>(schema: ZodType<ReqBody>) {
  return declareRequestHandler<ReqBody, {}, P, ReqQuery>((req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      throw new ServerError(400, "Invalid request.");
    }
  });
}
