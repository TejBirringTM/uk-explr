import { z } from "zod";

const QueryRequest = z.object({
  mode: z.union([
    z.literal("oa"), // output area
    z.literal("lsoa"), // lower layer super output area
    z.literal("msoa"), // middle layer super output area
    z.literal("pc"), // postal codes
    z.literal("oa+pc"), // output area + postal codes
    z.literal("lsoa+pc"), // lower layer super output area + postal codes
    z.literal("msoa+pc"), // middle layer super output area + postal codes
  ]),
});

export default QueryRequest;
export type Query = z.infer<typeof QueryRequest>;
