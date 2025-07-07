import { declareController } from "@/server/utils/declare-controller";
import { z } from "zod";

const myIpController = declareController(
  z.undefined(),
  z.object({
    data: z.object({
      ip: z.string().ip().or(z.null()),
    }),
  }),
  async (req) => {
    return {
      data: {
        ip: req.ip ?? null,
      },
    };
  },
);

export default myIpController;
