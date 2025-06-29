import "../../libs/load-env";
import { dbName } from "../../libs/config";
import pg from "../../libs/pg";
import { z } from "zod";
import processCsv from "../../libs/process-csv";
import { countRows } from "../helpers/pg";

const client = pg("editor", dbName);
const queryString = `INSERT INTO "uk-census-data"."postal-codes" VALUES ($1, $2, $3)`;

await client.transaction(async (client)=>{
    // check table is empty
    const nRowsInTable = await countRows(client, "uk-census-data", "postal-codes");
    if (nRowsInTable > 0) {
        console.error(`The table must be empty before migration: "${dbName}"."uk-census-data"."postal-codes"`);
        process.exit(1);
    }
});

// process the CSVs
processCsv([
    "./data/raw/uk-census-data/postal-codes/PCD_OA21_LSOA21_MSOA21_LAD_AUG24_UK_LU.csv",
], 
{
    delimiter: ",",
    columns: true,
    trim: true,
    skipEmptyLines: true,
    relaxColumnCount: true,
    encoding: "utf8",
    bom: true
},

    z.object({
        pcds: z.string(),
        oa21cd: z.string().optional()
    })
,
    async (parsed, raw)=>{
        console.debug(parsed);
        if (parsed.oa21cd) {
            // const r = await client.query(`SELECT "id" from "uk-census-data"."output-areas" WHERE "id" = '${id}'`);
            // if (r.rows.length === 0) {
            //     console.log(`'${id}' does not exist.`);     
            // } else {
            //     console.log(`'${id}' found.`);     
            // }
            // Note: the conditional is required to filter out output area codes that begin with 'S' (Scotland) and 'N' (Northern Ireland),
            //       which are not yet account for.
            if (parsed["oa21cd"].startsWith("E")) {
                const id = `${parsed["oa21cd"]}@2021`;
                await client.query(queryString, [
                    id,
                    parsed["pcds"],
                    "pcds-to-oa21cd(aug-2024)"
                ]);
            }
        }
    },
        async ()=>{
            await client.close();
        }
    );
