import { dbName } from "@/libs/config";
import pg from "@/libs/pg/client";
import { z } from "zod";
import processCsv from "@/libs/process-csv";
import { assertTableIsEmpty } from "@/libs/pg/utils";

await assertTableIsEmpty(dbName, "uk-census-data", "postal-codes");

const client = pg("editor", dbName);
const queryString = `INSERT INTO "uk-census-data"."postal-codes" VALUES ($1, $2, $3, $4, default)`;

// process the CSVs
export default await processCsv(
  "migrate postal codes",
  [
    "./data/raw/uk-census-data/postal-codes/PCD_OA21_LSOA21_MSOA21_LAD_AUG24_UK_LU.csv",
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
    pcds: z.string(),
    oa21cd: z.string().optional(),
  }),
  async (parsed, raw) => {
    /**
     * Note: the conditional statement is required to filter out output area codes
     * that begin with 'S' (Scotland) and 'N' (Northern Ireland), since we are not
     * importing them yet.
     */
    if (
      parsed.oa21cd &&
      (parsed["oa21cd"].startsWith("E") || parsed["oa21cd"].startsWith("W"))
    ) {
      const id = `${parsed["oa21cd"]}@2021`;
      await client.query(queryString, [id, parsed["pcds"], "August", 2024]);
      return parsed;
    } else {
      return null;
    }
  },
  async () => {
    await client.close();
  },
);
