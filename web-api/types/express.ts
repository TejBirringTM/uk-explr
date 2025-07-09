import type {
  RequestHandler,
  ErrorRequestHandler,
  ParamsDictionary,
} from "express-serve-static-core";
import type { ZodType } from "zod";

export type Locals<ResBody extends object> = {
  response?: ResBody;
  responseSchema?: ZodType<ResBody>;
  responseCacheKey?: string;
};
