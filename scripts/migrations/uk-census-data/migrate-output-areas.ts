import { dbName } from "@/libs/config";
import pg from "@/libs/pg";
import { z } from "zod";
import processCsv from "@/libs/process-csv";
import { assertTableIsEmpty } from "../../helpers/pg";

await assertTableIsEmpty(dbName, "uk-census-data", "output-areas");

const client = pg("editor", dbName);
const queryString = `INSERT INTO "uk-census-data"."output-areas" VALUES (default, $1, $2, $3, $4, $5, $6, $7)`;

// process the CSVs
export default await processCsv(
  "migrate output areas",
  [
    "./data/raw/uk-census-data/output-areas/Output_Area_to_Lower_layer_Super_Output_Area_to_Middle_layer_Super_Output_Area_to_Local_Authority_District_(December_2021)_Lookup_in_England_and_Wales_v3.csv",
    "./data/raw/uk-census-data/output-areas/Output_Area_to_Lower_layer_Super_Output_Area_to_Middle_layer_Super_Output_Area_to_Local_Authority_District_(December_2011)_Lookup_in_England_and_Wales.csv",
    "./data/raw/uk-census-data/output-areas/OA01_LSOA01_MSOA01_EW_LU_b75358eac2274f4fb012dcd32d13f5cf_-6173262702410378384.csv",
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

  z
    .object({
      // 2021 data:
      OA21CD: z.string(),
      OA21NM: z.string(),
      // OA21NMW: z.string(),

      LSOA21CD: z.string(),
      LSOA21NM: z.string(),
      // LSOA21NMW: z.string(),

      MSOA21CD: z.string(),
      MSOA21NM: z.string(),
      // MSOA21NMW: z.string(),

      // 2011 data:
      OA11CD: z.string(),
      OA11NM: z.string(),
      // OA11NMW: z.string(),

      LSOA11CD: z.string(),
      LSOA11NM: z.string(),
      // LSOA11NMW: z.string(),

      MSOA11CD: z.string(),
      MSOA11NM: z.string(),
      // MSOA11NMW: z.string(),

      // 2001 data:
      OA01CD: z.string(),
      OA01NM: z.string(),
      // OA01NMW: z.string(),

      LSOA01CD: z.string(),
      LSOA01NM: z.string(),
      // LSOA01NMW: z.string(),

      MSOA01CD: z.string(),
      MSOA01NM: z.string(),
      // MSOA01NMW: z.string()
    })
    .partial(),
  async (parsed, raw) => {
    if (parsed.OA21CD) {
      await client.query(queryString, [
        parsed.OA21CD || null,
        2021,
        parsed.LSOA21CD || null,
        parsed.MSOA21CD || null,
        parsed.OA21NM || null,
        parsed.LSOA21NM || null,
        parsed.MSOA21NM || null,
      ]);
    } else if (parsed.OA11CD) {
      await client.query(queryString, [
        parsed.OA11CD || null,
        2011,
        parsed.LSOA11CD || null,
        parsed.MSOA11CD || null,
        parsed.OA11NM || null,
        parsed.LSOA11NM || null,
        parsed.MSOA11NM || null,
      ]);
    } else if (parsed.OA01CD) {
      await client.query(queryString, [
        parsed.OA01CD || null,
        2001,
        parsed.LSOA01CD || null,
        parsed.MSOA01CD || null,
        parsed.OA01NM || null,
        parsed.LSOA01NM || null,
        parsed.MSOA01NM || null,
      ]);
    }
    return parsed;
  },
  async () => {
    await client.close();
  },
);
