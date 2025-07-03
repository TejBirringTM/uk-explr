execute([
  (await import("./uk-census-data/migrate-output-areas")).default,
  (await import("./uk-census-data/migrate-postal-codes")).default,
  (await import("./uk-census-data/migrate-occupations")).default,
  (await import("./uk-census-data/migrate-highest-qualifications")).default,
  (await import("./uk-census-data/migrate-economic-activity-statuses")).default,
  (await import("./uk-census-data/migrate-housing-tenures")).default,
  (await import("./uk-census-data/migrate-socio-economic-classifications")).default,
]);

import type { CsvProcessStats } from "@/libs/process-csv";
function execute(processCsvTasks: CsvProcessStats[]) {
  const resultObj: Record<string, {}> = {};
  for (const task of processCsvTasks) {
    resultObj[task.name] = {
      "# Rows": task.nRowsProcessed.toLocaleString(),
      Duration: task.duration.inSeconds.toLocaleString() + " seconds",
    };
  }
  console.table(resultObj);
}
