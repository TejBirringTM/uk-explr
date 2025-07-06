import { dbName } from "@/libs/config";
import pgClient from "@/libs/pg-client";
import { executeProcessCsvSequence } from "@/libs/process-csv";
import { withTickTockAsync } from "@/libs/tick-tock";

await executeProcessCsvSequence([
  "scripts/migrations/uk-census-data/migrate-output-areas",
  "scripts/migrations/uk-census-data/migrate-postal-codes",
  "scripts/migrations/uk-census-data/migrate-occupations",
  "scripts/migrations/uk-census-data/migrate-highest-qualifications",
  "scripts/migrations/uk-census-data/migrate-economic-activity-statuses",
  "scripts/migrations/uk-census-data/migrate-housing-tenures",
  "scripts/migrations/uk-census-data/migrate-socio-economic-classifications",
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
