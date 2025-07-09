import { declareController } from "@/web-api/libs/utils/declare-controller";
import { z } from "zod";

const myIpController = declareController(
  {
    requestBodySchema: z.undefined(),
    requestQuerySchema: z.object({}),
    responseBodySchema: z.object({
      data: z.object({
        ip: z.string().ip().or(z.null()),
      }),
    }),
  },
  async (req) => {
    return {
      data: {
        ip: req.ip ?? null,
      },
    };
  },
);

export default myIpController;
