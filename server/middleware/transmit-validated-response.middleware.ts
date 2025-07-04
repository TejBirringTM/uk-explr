import type { ParamsDictionary } from "express-serve-static-core";
import declareRequestHandler from "../utils/declare-request-handler";
import type { ParsedQs } from "qs";
import { ServerError } from "../types/server-error";

export default function transmitValidatedResponse<
  ReqBody extends object,
  P = ParamsDictionary,
  ReqQuery = ParsedQs,
>() {
  return declareRequestHandler<ReqBody, {}, P, ReqQuery>((req, res, next) => {
    if (res.locals.responseSchema && res.locals.response) {
      try {
        const parsed = res.locals.responseSchema.parse(res.locals.response);
        res.status(200).json({
          success: true,
          error: false,
          status: 200,
          ...parsed,
        });
      } catch (error) {
        console.error(error);
        throw new ServerError(500, "Invalid response.");
      }
    } else {
      throw new ServerError(500, "Invalid response.");
    }
  });
}
