import type { ParamsDictionary } from "express-serve-static-core";
import { cache, generateCacheKey } from "../services/cache";
import type { ApiSuccessResponse } from "../types/api-response";
import declareRequestHandler from "../libs/utils/declare-request-handler";

export default function responseCacher<
  ReqBody extends object | undefined,
  ResBody extends object,
  ReqQuery extends object,
  P = ParamsDictionary,
>() {
  return declareRequestHandler<ReqBody, ResBody, ReqQuery, P>(
    async (req, res, next) => {
      const key = generateCacheKey(req);
      console.log(`'${key.raw}' => '${key.hashed}'`);
      res.locals.responseCacheKey = key.hashed;
      const cachedResponse = await cache.get<string>(key.hashed);
      if (cachedResponse) {
        console.log(`Cache HIT '${res.locals.responseCacheKey}'`);
        const parsed: ApiSuccessResponse<ResBody> = JSON.parse(cachedResponse);
        res.status(parsed.status).json(parsed);
      } else {
        console.log(`Cache MISS '${res.locals.responseCacheKey}'`);
        next();
      }
    },
  );
}
