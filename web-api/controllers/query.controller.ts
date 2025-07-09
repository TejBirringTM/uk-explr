import { z } from "zod";
import QueryRequest, {
  type QueryRequest as TQueryRequest,
} from "../models/QueryRequest";
import QueryResponse from "../models/QueryResponse";
import { declareController } from "@/web-api/libs/utils/declare-controller";
import pg from "@/libs/pg/client";
import { dbName } from "@/libs/config";

const modeToCol = {
  pc: "postal_codes",
  oa: "oa_code",
  lsoa: "lsoa_code",
  msoa: "msoa_code",
  lad: "lad_code",
} satisfies Record<TQueryRequest["mode"], string>;

const sortToCols = {
  "by-name-asc": {
    mode: {
      pc: "postal_codes",
      oa: "oa_code",
      lsoa: "lsoa_name",
      msoa: "msoa_name",
      lad: "lad_name",
    },
    direction: "ASC",
  },
  "by-name-dsc": {
    mode: {
      pc: "postal_codes",
      oa: "oa_code",
      lsoa: "lsoa_name",
      msoa: "msoa_name",
      lad: "lad_name",
    },
    direction: "DESC",
  },
} satisfies Record<
  TQueryRequest["sort"],
  {
    mode: Record<TQueryRequest["mode"], string>;
    direction: "ASC" | "DESC";
  }
>;

const whereTemplate = (
  mode?: TQueryRequest["mode"],
  codes?: TQueryRequest["codes"],
) => {
  if (!mode || !codes) {
    return "";
  } else if (typeof codes === "string") {
    return `WHERE "${modeToCol[mode]}" = '${codes}'`;
  } else {
    return `WHERE "${modeToCol[mode]}" in (${codes.map((c) => `'${c}'`)})`;
  }
};

const sortTemplate = (
  mode?: TQueryRequest["mode"],
  sort?: TQueryRequest["sort"],
) => {
  if (!mode || !sort) {
    return "";
  }
  const col = sortToCols[sort]["mode"][mode];
  const dir = sortToCols[sort]["direction"];
  return `ORDER BY "${col}" ${dir}`;
};

const queryController = declareController(
  {
    requestBodySchema: z.undefined(),
    requestQuerySchema: QueryRequest,
    responseBodySchema: QueryResponse,
  },
  async (req) => {
    const { pageSize, pageNumber, mode, codes, sort } = req.query;
    const limit = pageSize!;
    const offset = (pageNumber! - 1) * limit;

    const query =
      codes === "*"
        ? `SELECT * FROM "uk-census-data"."output-area-to-postal-codes-lookup" ${sortTemplate(mode, sort)} LIMIT ${limit} OFFSET ${offset}`
        : `SELECT * FROM "uk-census-data"."output-area-to-postal-codes-lookup" ${whereTemplate(mode, codes)} ${sortTemplate(mode, sort)} LIMIT ${limit} OFFSET ${offset}`;

    console.log(query);

    const client = pg("reader", dbName);
    const result = await client.query(query);

    return {
      data: result.rows,
      length: result.rows.length,
    };
  },
);

export default queryController;
