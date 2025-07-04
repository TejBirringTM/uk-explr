import type { ZodType } from "zod";

export type Locals<T extends object> = {
  response?: T;
  responseSchema?: ZodType<T>;
};
