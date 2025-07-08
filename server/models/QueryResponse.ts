import { z } from "zod";

const QueryResponse = z.object({
  length: z.number().int().gte(0),
  data: z.array(z.object({})),
});

export default QueryResponse;
export type QueryResponse = z.infer<typeof QueryResponse>;
