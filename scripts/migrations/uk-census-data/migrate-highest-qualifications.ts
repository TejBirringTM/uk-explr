import { dbName } from "@/libs/config";
import pg from "@/libs/pg-client";
import { z } from "zod";
import processCsv from "@/libs/process-csv";
import { assertTableIsEmpty } from "@/utils/pg";

await assertTableIsEmpty(dbName, "uk-census-data", "highest-qualifications");

const client = pg("editor", dbName);
const queryString = `INSERT INTO "uk-census-data"."highest-qualifications" VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;

// process the CSVs
export default await processCsv(
  "migrate highest qualifications",
  [
    "./data/raw/uk-census-data/highest-qualification/2021-ts067-highest-level-of-qualification.csv",
  ],
  {
    delimiter: ",",
    columns: true,
    trim: true,
    skipEmptyLines: true,
    relaxColumnCount: true,
    encoding: "utf8",
    bom: true,
  },

  z.object({
    date: z.coerce.number().int().gte(0),
    "geography code": z.string(),
    "Highest level of qualification: Total: All usual residents aged 16 years and over":
      z.coerce.number().int().gte(0),
    "Highest level of qualification: No qualifications": z.coerce
      .number()
      .int()
      .gte(0),
    "Highest level of qualification: Level 1 and entry level qualifications":
      z.coerce.number().int().gte(0),
    "Highest level of qualification: Level 2 qualifications": z.coerce
      .number()
      .int()
      .gte(0),
    "Highest level of qualification: Apprenticeship": z.coerce
      .number()
      .int()
      .gte(0),
    "Highest level of qualification: Level 3 qualifications": z.coerce
      .number()
      .int()
      .gte(0),
    "Highest level of qualification: Level 4 qualifications and above": z.coerce
      .number()
      .int()
      .gte(0),
    "Highest level of qualification: Other qualifications": z.coerce
      .number()
      .int()
      .gte(0),
  }),
  async (parsed, raw) => {
    await client.query(queryString, [
      `${parsed["geography code"]}@${parsed.date}`,
      parsed[
        "Highest level of qualification: Total: All usual residents aged 16 years and over"
      ],
      parsed["Highest level of qualification: No qualifications"],
      parsed[
        "Highest level of qualification: Level 1 and entry level qualifications"
      ],
      parsed["Highest level of qualification: Level 2 qualifications"],
      parsed["Highest level of qualification: Apprenticeship"],
      parsed["Highest level of qualification: Level 3 qualifications"],
      parsed[
        "Highest level of qualification: Level 4 qualifications and above"
      ],
      parsed["Highest level of qualification: Other qualifications"],
    ]);
    return parsed;
  },
  async () => {
    await client.close();
  },
);
