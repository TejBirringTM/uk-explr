import { dbName } from "@/libs/config";
import pgClient from "@/libs/pg/client";
import { executeProcessCsvSequence } from "@/libs/process-csv";
import { withTickTockAsync } from "@/libs/tick-tock";
import { fileURLToPath } from "node:url";

export async function migrateDataFromCsvToDb() {
  await executeProcessCsvSequence([
    "etl-pipeline/migrations/uk-census-data/migrate-output-areas",
    "etl-pipeline/migrations/uk-census-data/migrate-postal-codes",
    "etl-pipeline/migrations/uk-census-data/migrate-occupations",
    "etl-pipeline/migrations/uk-census-data/migrate-highest-qualifications",
    "etl-pipeline/migrations/uk-census-data/migrate-economic-activity-statuses",
    "etl-pipeline/migrations/uk-census-data/migrate-housing-tenures",
    "etl-pipeline/migrations/uk-census-data/migrate-socio-economic-classifications",
  ]);

  await withTickTockAsync(async () => {
    console.log("Updating lookup table...");
    const client = pgClient("editor", dbName);
    await client.query(
      `REFRESH MATERIALIZED VIEW "uk-census-data"."output-area-to-postal-codes-lookup"`,
    );
    await client.close();
  }).then((duration) => {
    console.log(`Lookup table updated in ${duration.inSeconds} seconds.`);
  });

  console.log("Done!");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await migrateDataFromCsvToDb();
}
