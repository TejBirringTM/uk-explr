import { dbName } from "@/libs/config";
import pg from "@/libs/pg-client";
import { z } from "zod";
import processCsv from "@/libs/process-csv";
import { assertTableIsEmpty } from "@/utils/pg";

await assertTableIsEmpty(dbName, "uk-census-data", "occupations");

const client = pg("editor", dbName);
const queryString = `INSERT INTO "uk-census-data"."occupations" VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;

// process the CSVs
export default await processCsv(
  "migrate occupations",
  ["./data/raw/uk-census-data/occupation/2021-ts063-occupation.csv"],
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
    "Occupation (current): Total: All usual residents aged 16 years and over in employment the week before the census":
      z.coerce.number().int().gte(0),
    "Occupation (current): 1. Managers, directors and senior officials":
      z.coerce.number().int().gte(0),
    "Occupation (current): 2. Professional occupations": z.coerce
      .number()
      .int()
      .gte(0),
    "Occupation (current): 3. Associate professional and technical occupations":
      z.coerce.number().int().gte(0),
    "Occupation (current): 4. Administrative and secretarial occupations":
      z.coerce.number().int().gte(0),
    "Occupation (current): 5. Skilled trades occupations": z.coerce
      .number()
      .int()
      .gte(0),
    "Occupation (current): 6. Caring, leisure and other service occupations":
      z.coerce.number().int().gte(0),
    "Occupation (current): 7. Sales and customer service occupations": z.coerce
      .number()
      .int()
      .gte(0),
    "Occupation (current): 8. Process, plant and machine operatives": z.coerce
      .number()
      .int()
      .gte(0),
    "Occupation (current): 9. Elementary occupations": z.coerce
      .number()
      .int()
      .gte(0),
  }),
  async (parsed, raw) => {
    await client.query(queryString, [
      `${parsed["geography code"]}@${parsed.date}`,
      parsed[
        "Occupation (current): Total: All usual residents aged 16 years and over in employment the week before the census"
      ],
      parsed[
        "Occupation (current): 1. Managers, directors and senior officials"
      ],
      parsed["Occupation (current): 2. Professional occupations"],
      parsed[
        "Occupation (current): 3. Associate professional and technical occupations"
      ],
      parsed[
        "Occupation (current): 4. Administrative and secretarial occupations"
      ],
      parsed["Occupation (current): 5. Skilled trades occupations"],
      parsed[
        "Occupation (current): 6. Caring, leisure and other service occupations"
      ],
      parsed["Occupation (current): 7. Sales and customer service occupations"],
      parsed["Occupation (current): 8. Process, plant and machine operatives"],
      parsed["Occupation (current): 9. Elementary occupations"],
    ]);
    return parsed;
  },
  async () => {
    await client.close();
  },
);
