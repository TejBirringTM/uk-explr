import type { ParamsDictionary } from "express-serve-static-core";
import declareRequestHandler from "../utils/declare-request-handler";
import { ServerError } from "../types/server-error";
import type { ApiSuccessResponse } from "../types/api-response";
import { cache } from "../services/cache";
import { logError } from "@/libs/error";

export default function responseDispatcher<
  ReqBody extends object | undefined,
  ResBody extends object,
  ReqQuery extends object,
  P = ParamsDictionary,
>() {
  return declareRequestHandler<ReqBody, ResBody, ReqQuery, P>(
    (req, res, next) => {
      if (res.locals.responseSchema && res.locals.response) {
        try {
          const parsed = res.locals.responseSchema.parse(res.locals.response);
          const responseObj = {
            success: true,
            error: false,
            status: 200,
            ...parsed,
          } satisfies ApiSuccessResponse<ResBody>;
          if (res.locals.responseCacheKey) {
            cache.set(res.locals.responseCacheKey, JSON.stringify(responseObj));
            console.log(
              `Cache set response '${res.locals.responseCacheKey}':\n`,
              responseObj,
            );
          }
          res.status(200).json(responseObj);
        } catch (error) {
          logError(error);
          throw new ServerError(500, "Invalid response.");
        }
      } else {
        /* 
        the only time this can happen (if `declareController(...)` is used to implement controller fns)
        is when the request handler is not found for the requested route.
      */
        throw new ServerError(404, "Resource does not exist.");
      }
    },
  );
}
