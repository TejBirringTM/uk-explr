import { dbName } from "@/libs/config";
import pg from "@/libs/pg/client";
import { z } from "zod";
import processCsv from "@/libs/process-csv";
import { assertTableIsEmpty } from "@/libs/pg/utils";

await assertTableIsEmpty(dbName, "uk-census-data", "housing-tenures");

const client = pg("editor", dbName);
const queryString = `INSERT INTO "uk-census-data"."housing-tenures" VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`;

// process the CSVs
export default await processCsv(
  "migrate housing tenures",
  ["./data/raw/uk-census-data/housing-tenure/2021-ts054-housing-tenure.csv"],
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
    "Tenure of household: Total: All households": z.coerce
      .number()
      .int()
      .gte(0),
    "Tenure of household: Owned": z.coerce.number().int().gte(0),
    "Tenure of household: Owned: Owns outright": z.coerce.number().int().gte(0),
    "Tenure of household: Owned: Owns with a mortgage or loan": z.coerce
      .number()
      .int()
      .gte(0),
    "Tenure of household: Shared ownership": z.coerce.number().int().gte(0),
    "Tenure of household: Shared ownership: Shared ownership": z.coerce
      .number()
      .int()
      .gte(0),
    "Tenure of household: Social rented": z.coerce.number().int().gte(0),
    "Tenure of household: Social rented: Rents from council or Local Authority":
      z.coerce.number().int().gte(0),
    "Tenure of household: Social rented: Other social rented": z.coerce
      .number()
      .int()
      .gte(0),
    "Tenure of household: Private rented": z.coerce.number().int().gte(0),
    "Tenure of household: Private rented: Private landlord or letting agency":
      z.coerce.number().int().gte(0),
    "Tenure of household: Private rented: Other private rented": z.coerce
      .number()
      .int()
      .gte(0),
    "Tenure of household: Lives rent free": z.coerce.number().int().gte(0),
  }),
  async (parsed, raw) => {
    await client.query(queryString, [
      `${parsed["geography code"]}@${parsed.date}`,
      parsed["Tenure of household: Total: All households"],
      parsed["Tenure of household: Owned"],
      parsed["Tenure of household: Owned: Owns outright"],
      parsed["Tenure of household: Owned: Owns with a mortgage or loan"],
      parsed["Tenure of household: Shared ownership"],
      parsed["Tenure of household: Social rented"],
      parsed[
        "Tenure of household: Social rented: Rents from council or Local Authority"
      ],
      parsed["Tenure of household: Social rented: Other social rented"],
      parsed["Tenure of household: Private rented"],
      parsed[
        "Tenure of household: Private rented: Private landlord or letting agency"
      ],
      parsed["Tenure of household: Private rented: Other private rented"],
      parsed["Tenure of household: Lives rent free"],
    ]);
    return parsed;
  },
  async () => {
    await client.close();
  },
);
