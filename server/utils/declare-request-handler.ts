import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ApiSuccessResponse } from "../types/api-response";
import type { Locals } from "../types/express";

export type HandlerFnSync<
  ReqBody extends object | undefined,
  ResBody extends object,
  ReqQuery extends object,
  P = ParamsDictionary,
> = (
  req: Request<
    P,
    ApiSuccessResponse<ResBody>,
    ReqBody,
    ReqQuery,
    Locals<ResBody>
  >,
  res: Response<ApiSuccessResponse<ResBody>, Locals<ResBody>>,
  next: NextFunction,
) => void;

export type HandlerFnAsync<
  ReqBody extends object | undefined,
  ResBody extends object,
  ReqQuery extends object,
  P = ParamsDictionary,
> = (
  req: Request<
    P,
    ApiSuccessResponse<ResBody>,
    ReqBody,
    ReqQuery,
    Locals<ResBody>
  >,
  res: Response<ApiSuccessResponse<ResBody>, Locals<ResBody>>,
  next: NextFunction,
) => Promise<void>;

export default function declareRequestHandler<
  ReqBody extends object | undefined,
  ResBody extends object,
  ReqQuery extends object,
  P = ParamsDictionary,
>(
  handlerFn:
    | HandlerFnSync<ReqBody, ResBody, ReqQuery, P>
    | HandlerFnAsync<ReqBody, ResBody, ReqQuery, P>,
) {
  return handlerFn;
}

export type ServerRequestHandler<
  ReqBody extends object | undefined,
  ResBody extends object,
  ReqQuery extends object,
  P = ParamsDictionary,
> = ReturnType<typeof declareRequestHandler<ReqBody, ResBody, ReqQuery, P>>;
