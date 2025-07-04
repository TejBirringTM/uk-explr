import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ParsedQs } from "qs";
import type { Locals } from "../types/express";
import type { ApiSuccessResponse } from "../types/api-response";

export type HandlerFnSync<
  ReqBody extends object,
  ResInnerBody extends object,
  P = ParamsDictionary,
  ReqQuery = ParsedQs,
> = (
  req: Request<
    P,
    ApiSuccessResponse<Locals<ResInnerBody>["response"]>,
    ReqBody,
    ReqQuery,
    Locals<ResInnerBody>
  >,
  res: Response<
    ApiSuccessResponse<Locals<ResInnerBody>["response"]>,
    Locals<ResInnerBody>
  >,
  next: NextFunction,
) => void;

export type HandlerFnAsync<
  ReqBody extends object,
  ResInnerBody extends object,
  P = ParamsDictionary,
  ReqQuery = ParsedQs,
> = (
  req: Request<
    P,
    ApiSuccessResponse<Locals<ResInnerBody>["response"]>,
    ReqBody,
    ReqQuery,
    Locals<ResInnerBody>
  >,
  res: Response<
    ApiSuccessResponse<Locals<ResInnerBody>["response"]>,
    Locals<ResInnerBody>
  >,
  next: NextFunction,
) => Promise<void>;

export default function declareRequestHandler<
  ReqBody extends object,
  ResInnerBody extends object,
  P = ParamsDictionary,
  ReqQuery = ParsedQs,
>(
  handlerFn:
    | HandlerFnSync<ReqBody, ResInnerBody, P, ReqQuery>
    | HandlerFnAsync<ReqBody, ResInnerBody, P, ReqQuery>,
) {
  return handlerFn;
}
