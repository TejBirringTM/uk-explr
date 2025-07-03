import { dbName } from "@/libs/config";
import pg from "@/libs/pg";
import { z } from "zod";
import processCsv from "@/libs/process-csv";
import { assertTableIsEmpty } from "../../helpers/pg";

// await assertTableIsEmpty(dbName, "uk-census-data", "socio-economic-classifications");

const client = pg("editor", dbName);
const queryString = `INSERT INTO "uk-census-data"."socio-economic-classifications" VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;

// process the CSVs
export default await processCsv(
  "migrate socio-economic classifications",
  [
    "./data/raw/uk-census-data/socio-economic-classification/2021-ts062-socio-economic-classification.csv",
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
    "National Statistics Socio-economic Classification (NS-SEC): Total: All usual residents aged 16 years and over":
      z.coerce.number().int().gte(0),
    "National Statistics Socio-economic Classification (NS-SEC): L1, L2 and L3 Higher managerial, administrative and professional occupations":
      z.coerce.number().int().gte(0),
    "National Statistics Socio-economic Classification (NS-SEC): L4, L5 and L6 Lower managerial, administrative and professional occupations":
      z.coerce.number().int().gte(0),
    "National Statistics Socio-economic Classification (NS-SEC): L7 Intermediate occupations":
      z.coerce.number().int().gte(0),
    "National Statistics Socio-economic Classification (NS-SEC): L8 and L9 Small employers and own account workers":
      z.coerce.number().int().gte(0),
    "National Statistics Socio-economic Classification (NS-SEC): L10 and L11 Lower supervisory and technical occupations":
      z.coerce.number().int().gte(0),
    "National Statistics Socio-economic Classification (NS-SEC): L12 Semi-routine occupations":
      z.coerce.number().int().gte(0),
    "National Statistics Socio-economic Classification (NS-SEC): L13 Routine occupations":
      z.coerce.number().int().gte(0),
    "National Statistics Socio-economic Classification (NS-SEC): L14.1 and L14.2 Never worked and long-term unemployed":
      z.coerce.number().int().gte(0),
    "National Statistics Socio-economic Classification (NS-SEC): L15 Full-time students":
      z.coerce.number().int().gte(0),
  }),
  async (parsed, raw) => {
    await client.query(queryString, [
      `${parsed["geography code"]}@${parsed.date}`,
      parsed[
        "National Statistics Socio-economic Classification (NS-SEC): Total: All usual residents aged 16 years and over"
      ],
      parsed[
        "National Statistics Socio-economic Classification (NS-SEC): L1, L2 and L3 Higher managerial, administrative and professional occupations"
      ],
      parsed[
        "National Statistics Socio-economic Classification (NS-SEC): L4, L5 and L6 Lower managerial, administrative and professional occupations"
      ],
      parsed[
        "National Statistics Socio-economic Classification (NS-SEC): L7 Intermediate occupations"
      ],
      parsed[
        "National Statistics Socio-economic Classification (NS-SEC): L8 and L9 Small employers and own account workers"
      ],
      parsed[
        "National Statistics Socio-economic Classification (NS-SEC): L10 and L11 Lower supervisory and technical occupations"
      ],
      parsed[
        "National Statistics Socio-economic Classification (NS-SEC): L12 Semi-routine occupations"
      ],
      parsed[
        "National Statistics Socio-economic Classification (NS-SEC): L13 Routine occupations"
      ],
      parsed[
        "National Statistics Socio-economic Classification (NS-SEC): L14.1 and L14.2 Never worked and long-term unemployed"
      ],
      parsed[
        "National Statistics Socio-economic Classification (NS-SEC): L15 Full-time students"
      ],
    ]);
    return parsed;
  },
  async () => {
    await client.close();
  },
);
