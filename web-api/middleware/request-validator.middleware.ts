import type { ParamsDictionary } from "express-serve-static-core";
import type { ZodType } from "zod";
import declareRequestHandler from "@/web-api/libs/utils/declare-request-handler";
import { ServerError } from "../types/server-error";
import { logError } from "@/libs/error";

export default function requestValidator<
  ReqBody extends object | undefined,
  ResBody extends object,
  ReqQuery extends object,
  P = ParamsDictionary,
>(bodySchema: ZodType<ReqBody>, querySchema: ZodType<ReqQuery>) {
  return declareRequestHandler<ReqBody, ResBody, ReqQuery, P>(
    (req, res, next) => {
      try {
        const parsedBody = bodySchema.parse(req.body);
        const parsedQuery = querySchema.parse(req.query);
        // override the request's 'body' property for safety
        Object.defineProperty(req, "body", {
          value: parsedBody,
          writable: true,
          enumerable: true,
          configurable: true,
        });
        // override the request's 'query' property for safety
        Object.defineProperty(req, "query", {
          value: parsedQuery,
          writable: true,
          enumerable: true,
          configurable: true,
        });
        // call next handler
        next();
      } catch (error) {
        logError(error);
        throw new ServerError(400, "Invalid request.");
      }
    },
  );
}
