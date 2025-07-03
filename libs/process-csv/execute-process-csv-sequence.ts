import type { CsvProcessStats } from "@/libs/process-csv";
import appRootPath from "app-root-path";

export async function executeProcessCsvSequence(scriptPaths: string[]) {
  // execute processCsv script to accumulate results
  const csvProcessStatsAccumulate: CsvProcessStats[] = [];
  for (const path of scriptPaths) {
    csvProcessStatsAccumulate.push(
      (await import(`${appRootPath}/${path}`)).default,
    );
  }
  // produce formatted results table
  const results: Record<
    string,
    {
      "# Rows": string;
      Duration: string;
    }
  > = {};
  for (const stats of csvProcessStatsAccumulate) {
    results[stats.name] = {
      "# Rows": stats.nRowsProcessed.toLocaleString(),
      Duration: stats.duration.inSeconds.toLocaleString() + " seconds",
    };
  }
  const csvProcessStatsAggregate = csvProcessStatsAccumulate.reduce(
    (prev, curr) => ({
      nRowsProcessed: prev.nRowsProcessed + curr.nRowsProcessed,
      duration: {
        inMilliseconds:
          prev.duration.inMilliseconds + curr.duration.inMilliseconds,
        inSeconds: prev.duration.inSeconds + curr.duration.inSeconds,
      },
    }),
    {
      nRowsProcessed: 0n,
      duration: {
        inMilliseconds: 0,
        inSeconds: 0,
      },
    } satisfies Omit<CsvProcessStats, "name">,
  );
  results["Total"] = {
    "# Rows": csvProcessStatsAggregate.nRowsProcessed.toLocaleString(),
    Duration:
      csvProcessStatsAggregate.duration.inSeconds.toLocaleString() + " seconds",
  };
  // log the results
  console.table(results);
}
