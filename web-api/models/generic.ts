import { z } from "zod";

export const Id = z.string().nonempty();
export const Year = z.number().int().gt(0);
export const Code = z.string().nonempty();
export const Name = z.string().nonempty();
export const Quantity = z.number().int().gte(0);
