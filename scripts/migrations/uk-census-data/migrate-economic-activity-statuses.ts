import { dbName } from "@/libs/config";
import pg from "@/libs/pg";
import { z } from "zod";
import processCsv from "@/libs/process-csv";
import { assertTableIsEmpty } from "../../helpers/pg";

await assertTableIsEmpty(dbName, "uk-census-data", "economic-activity-status");

const client = pg("editor", dbName);
const queryString = `INSERT INTO "uk-census-data"."economic-activity-status" VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)`;

// process the CSVs
export default await processCsv(
  "migrate economic activity statuses",
  [
    "./data/raw/uk-census-data/economic-activity-status/2021-ts066-economic-activity-status.csv",
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
    "Economic activity status: Total: All usual residents aged 16 years and over":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active (excluding full-time students)":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active (excluding full-time students):In employment":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active (excluding full-time students):In employment:Employee":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active (excluding full-time students): In employment: Employee: Part-time":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active (excluding full-time students): In employment: Employee: Full-time":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active (excluding full-time students):In employment:Self-employed with employees":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active (excluding full-time students): In employment: Self-employed with employees: Part-time":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active (excluding full-time students): In employment: Self-employed with employees: Full-time":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active (excluding full-time students):In employment:Self-employed without employees":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active (excluding full-time students): In employment: Self-employed without employees: Part-time":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active (excluding full-time students): In employment: Self-employed without employees: Full-time":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active (excluding full-time students): Unemployed":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active and a full-time student":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active and a full-time student:In employment":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active and a full-time student:In employment:Employee":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active and a full-time student: In employment: Employee: Part-time":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active and a full-time student: In employment: Employee: Full-time":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active and a full-time student:In employment:Self-employed with employees":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active and a full-time student: In employment: Self-employed with employees: Part-time":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active and a full-time student: In employment: Self-employed with employees: Full-time":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active and a full-time student:In employment:Self-employed without employees":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active and a full-time student: In employment: Self-employed without employees: Part-time":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active and a full-time student: In employment: Self-employed without employees: Full-time":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically active and a full-time student: Unemployed":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically inactive": z.coerce
      .number()
      .int()
      .gte(0),
    "Economic activity status: Economically inactive: Retired": z.coerce
      .number()
      .int()
      .gte(0),
    "Economic activity status: Economically inactive: Student": z.coerce
      .number()
      .int()
      .gte(0),
    "Economic activity status: Economically inactive: Looking after home or family":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically inactive: Long-term sick or disabled":
      z.coerce.number().int().gte(0),
    "Economic activity status: Economically inactive: Other": z.coerce
      .number()
      .int()
      .gte(0),
  }),
  async (parsed, raw) => {
    await client.query(queryString, [
      `${parsed["geography code"]}@${parsed.date}`,
      parsed[
        "Economic activity status: Total: All usual residents aged 16 years and over"
      ],
      parsed[
        "Economic activity status: Economically active (excluding full-time students)"
      ],
      parsed[
        "Economic activity status: Economically active (excluding full-time students): Unemployed"
      ],
      parsed[
        "Economic activity status: Economically active (excluding full-time students):In employment"
      ],
      parsed[
        "Economic activity status: Economically active (excluding full-time students):In employment:Employee"
      ],
      parsed[
        "Economic activity status: Economically active (excluding full-time students): In employment: Employee: Full-time"
      ],
      parsed[
        "Economic activity status: Economically active (excluding full-time students): In employment: Employee: Part-time"
      ],
      parsed[
        "Economic activity status: Economically active (excluding full-time students):In employment:Self-employed without employees"
      ],
      parsed[
        "Economic activity status: Economically active (excluding full-time students): In employment: Self-employed without employees: Full-time"
      ],
      parsed[
        "Economic activity status: Economically active (excluding full-time students): In employment: Self-employed without employees: Part-time"
      ],
      parsed[
        "Economic activity status: Economically active (excluding full-time students):In employment:Self-employed with employees"
      ],
      parsed[
        "Economic activity status: Economically active (excluding full-time students): In employment: Self-employed with employees: Full-time"
      ],
      parsed[
        "Economic activity status: Economically active (excluding full-time students): In employment: Self-employed with employees: Part-time"
      ],
      parsed[
        "Economic activity status: Economically active and a full-time student"
      ],
      parsed[
        "Economic activity status: Economically active and a full-time student: Unemployed"
      ],
      parsed[
        "Economic activity status: Economically active and a full-time student:In employment"
      ],
      parsed[
        "Economic activity status: Economically active and a full-time student:In employment:Employee"
      ],
      parsed[
        "Economic activity status: Economically active and a full-time student: In employment: Employee: Full-time"
      ],
      parsed[
        "Economic activity status: Economically active and a full-time student: In employment: Employee: Part-time"
      ],
      parsed[
        "Economic activity status: Economically active and a full-time student:In employment:Self-employed without employees"
      ],
      parsed[
        "Economic activity status: Economically active and a full-time student: In employment: Self-employed without employees: Full-time"
      ],
      parsed[
        "Economic activity status: Economically active and a full-time student: In employment: Self-employed without employees: Part-time"
      ],
      parsed[
        "Economic activity status: Economically active and a full-time student:In employment:Self-employed with employees"
      ],
      parsed[
        "Economic activity status: Economically active and a full-time student: In employment: Self-employed with employees: Full-time"
      ],
      parsed[
        "Economic activity status: Economically active and a full-time student: In employment: Self-employed with employees: Part-time"
      ],
      parsed["Economic activity status: Economically inactive"],
      parsed["Economic activity status: Economically inactive: Retired"],
      parsed["Economic activity status: Economically inactive: Student"],
      parsed[
        "Economic activity status: Economically inactive: Looking after home or family"
      ],
      parsed[
        "Economic activity status: Economically inactive: Long-term sick or disabled"
      ],
      parsed["Economic activity status: Economically inactive: Other"],
    ]);
    return parsed;
  },
  async () => {
    await client.close();
  },
);
