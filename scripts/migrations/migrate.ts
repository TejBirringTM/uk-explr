import { executeProcessCsvSequence } from "@/libs/process-csv";

await executeProcessCsvSequence([
  "scripts/migrations/uk-census-data/migrate-output-areas",
  "scripts/migrations/uk-census-data/migrate-postal-codes",
  "scripts/migrations/uk-census-data/migrate-occupations",
  "scripts/migrations/uk-census-data/migrate-highest-qualifications",
  "scripts/migrations/uk-census-data/migrate-economic-activity-statuses",
  "scripts/migrations/uk-census-data/migrate-housing-tenures",
  "scripts/migrations/uk-census-data/migrate-socio-economic-classifications",
]);

console.debug("Done!");
