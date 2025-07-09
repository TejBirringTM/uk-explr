import { z } from "zod";
import { Code } from "./generic";

const QuerySortOption = <const K extends Lowercase<string>>(key: K) =>
  z.literal(`${key}-asc`).or(z.literal(`${key}-dsc`));

// const QuerySortOptionPermutationutation = <
//   const K extends Lowercase<string>,
//   const Perm extends Lowercase<string>,
// >(
//   key: K,
//   permutations: Perm[],
// ) =>
//   z.union(
//     permutations.flatMap((p) => [
//       z.literal(`${key}-${p}-asc`),
//       z.literal(`${key}-${p}-dsc`),
//     ]) as [
//       ZodLiteral<`${K}-${Perm}-asc` | `${K}-${Perm}-dsc`>,
//       ZodLiteral<`${K}-${Perm}-asc` | `${K}-${Perm}-dsc`>,
//       ...ZodLiteral<`${K}-${Perm}-asc` | `${K}-${Perm}-dsc`>[],
//     ],
//   );

// const QuerySortOptions = z
//   .union([
//     QuerySortOption("by-name"), // code is used when name is not applicable

//     QuerySortOptionPermutation("by-highest-qualification-gte-l4", [
//       "count",
//       "prop",
//       "oprop",
//     ]),
//     QuerySortOptionPermutation("by-highest-qualification-l3", [
//       "count",
//       "prop",
//       "oprop",
//     ]),
//     QuerySortOptionPermutation("by-highest-qualification-appr", [
//       "count",
//       "prop",
//       "oprop",
//     ]),
//     QuerySortOptionPermutation("by-highest-qualification-l2", [
//       "count",
//       "prop",
//       "oprop",
//     ]),
//     QuerySortOptionPermutation("by-highest-qualification-l1", [
//       "count",
//       "prop",
//       "oprop",
//     ]),
//     QuerySortOptionPermutation("by-highest-qualification-none", [
//       "count",
//       "prop",
//       "oprop",
//     ]),

//     // QuerySortOptionPermutation("by-occupation-exec", ["count", "prop", "oprop"]), // managers_and_directors_and_senior_officials
//     // QuerySortOptionPermutation("by-occupation-prof", ["count", "prop", "oprop"]), // professional_occupations
//     // QuerySortOptionPermutation("by-occupation-assoc", ["count", "prop", "oprop"]), // associate_professional_and_technical_occupations
//     // QuerySortOptionPermutation("by-occupation-admin", ["count", "prop", "oprop"]), // administrative_and_secretarial_occupations
//     // QuerySortOptionPermutation("by-occupation-skill", ["count", "prop", "oprop"]), // skilled_trades_occupations
//     // QuerySortOptionPermutation("by-occupation-serv", ["count", "prop", "oprop"]), // caring_and_leisure_and_other_service_occupations
//     // QuerySortOptionPermutation("by-occupation-sale", ["count", "prop", "oprop"]), // sales_and_customer_service_occupations
//     // QuerySortOptionPermutation("by-occupation-oper", ["count", "prop", "oprop"]), // process_and_plant_and_machine_operatives
//     // QuerySortOptionPermutation("by-occupation-elem", ["count", "prop", "oprop"]), // elementary_occupations

//     // QuerySortOptionPermutation("by-socioeconomic-class-1+2+3", ["count", "prop", "oprop"]),
//     // QuerySortOptionPermutation("by-socioeconomic-class-4+5+6", ["count", "prop", "oprop"]),
//     // QuerySortOptionPermutation("by-socioeconomic-class-7", ["count", "prop", "oprop"]),
//     // QuerySortOptionPermutation("by-socioeconomic-class-8+9", ["count", "prop", "oprop"]),
//     // QuerySortOptionPermutation("by-socioeconomic-class-10+11", ["count", "prop", "oprop"]),
//     // QuerySortOptionPermutation("by-socioeconomic-class-12", ["count", "prop", "oprop"]),
//     // QuerySortOptionPermutation("by-socioeconomic-class-13", ["count", "prop", "oprop"]),
//     // QuerySortOptionPermutation("by-socioeconomic-class-14", ["count", "prop", "oprop"]),
//     // QuerySortOptionPermutation("by-socioeconomic-class-15", ["count", "prop", "oprop"]),

//     // QuerySortOptionPermutation("by-houses-owned", ["count", "prop", "oprop"]),
//     // QuerySortOptionPermutation("by-houses-owned-outright", ["count", "prop", "oprop"]),
//     // QuerySortOptionPermutation("by-houses-owned-w-mortgage", ["count", "prop", "oprop"]),
//     // QuerySortOptionPermutation("by-houses-private-rented", ["count", "prop", "oprop"]),
//     // QuerySortOptionPermutation("by-houses-private-rented-via-ll-or-la", ["count", "prop", "oprop"]),
//     // QuerySortOptionPermutation("by-houses-private-rented-via-other", ["count", "prop", "oprop"]),
//     // QuerySortOptionPermutation("by-houses-social-rented", ["count", "prop", "oprop"]),
//     // QuerySortOptionPermutation("by-houses-social-rented-via-la", ["count", "prop", "oprop"]),
//     // QuerySortOptionPermutation("by-houses-social-rented-via-other", ["count", "prop", "oprop"]),
//   ])
//   .array();

const QueryRequest = z.object({
  mode: z
    .union([
      z.literal("pc"), // by postal code(s)
      z.literal("oa"), // by output area(s)
      z.literal("lsoa"), // by lower layer super output area(s)
      z.literal("msoa"), // by middle layer super output area(s)
      z.literal("lad"), // by local area district(s)
    ])
    .default("oa"),
  codes: z.union([Code, Code.array(), z.literal("*")]).default("*"),
  sort: QuerySortOption("by-name").default("by-name-asc"),
  pageSize: z.coerce.number().int().gte(25).lte(100).default(50),
  pageNumber: z.coerce.number().int().gte(1).default(1),
});

export default QueryRequest;
export type QueryRequest = z.infer<typeof QueryRequest>;
